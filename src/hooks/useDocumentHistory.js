import { useState, useEffect, useCallback, useRef } from 'react';
import { useWallet } from './useWallet';
import { useTotalMetrics } from './useTotalMetrics';
import { toast } from 'sonner';

// URL Subgraph Anda
const SUBGRAPH_URL = "https://api.studio.thegraph.com/query/118167/kontrakdigital/version/latest";
const SUBGRAPH_TIMEOUT = 3000; // 3 detik timeout
const DEBOUNCE_DELAY = 2000; // 2 detik debounce untuk auto-refresh

// --- State Awal ---
const initialState = {
    documents: [],
    totalDocuments: 0,
    currentPage: 1,
    itemsPerPage: 5, // Max 5 data per page
    loading: false,
    isRefreshing: false, // Untuk manual refresh
    error: null,
    search: '',
    filterType: '',
    activeCount: 0,
    expiredCount: 0,
    pendingSignatureCount: 0, // NEW: Menunggu TTD
    dataSource: null, // 'subgraph' atau 'blockchain'
};

export const useDocumentHistory = () => {
    const { address, isConnected, contract, signer } = useWallet();
    const { fetchTotalMetrics } = useTotalMetrics();
    const [state, setState] = useState(initialState);
    const { documents, totalDocuments, currentPage, itemsPerPage, loading, isRefreshing, error, search, filterType } = state;
    
    // Refs untuk debouncing dan cleanup
    const debounceTimerRef = useRef(null);
    const isMountedRef = useRef(true);

    // --- FETCH FROM SMART CONTRACT (BACKUP) ---
    const fetchFromSmartContract = useCallback(async (currentAddress, skip, limit) => {
        if (!contract || !currentAddress) {
            throw new Error("Contract not available");
        }

        try {
            console.log('🔗 Fetching from smart contract for:', currentAddress);
            
            const userDocDetails = await contract.getUserDocumentDetails(currentAddress);
            
            if (!userDocDetails || userDocDetails.length === 0) {
                return { documents: [], total: 0 };
            }

            let allDocs = userDocDetails.map((doc) => ({
                id: doc.ipfsHash,
                ipfsHash: doc.ipfsHash,
                originalFileName: doc.fileName,
                timestamp: Number(doc.timestamp),
                contractType: doc.contractType,
                contractDate: doc.contractDate,
                partyA: doc.partyA,
                partyAAddress: doc.partyAAddress,
                partyB: doc.partyB,
                partyBAddress: doc.partyBAddress,
                isPartyASigned: doc.isPartyASigned,
                isPartyBSigned: doc.isPartyBSigned,
            }));

            // Apply search filter
            if (search) {
                const searchLower = search.toLowerCase().trim();
                allDocs = allDocs.filter(doc => 
                    doc.ipfsHash?.toLowerCase().includes(searchLower) ||
                    doc.originalFileName?.toLowerCase().includes(searchLower) ||
                    doc.partyA?.toLowerCase().includes(searchLower) ||
                    doc.partyB?.toLowerCase().includes(searchLower) ||
                    doc.partyAAddress?.toLowerCase().includes(searchLower) ||
                    doc.partyBAddress?.toLowerCase().includes(searchLower)
                );
            }

            // Apply contract type filter
            if (filterType) {
                allDocs = allDocs.filter(doc => doc.contractType === filterType);
            }

            // Sort by timestamp descending
            allDocs.sort((a, b) => b.timestamp - a.timestamp);

            const total = allDocs.length;
            const paginatedDocs = allDocs.slice(skip, skip + limit);

            console.log(`✅ Smart contract returned ${total} documents (showing ${paginatedDocs.length})`);

            return { documents: paginatedDocs, total };

        } catch (err) {
            console.error("❌ Error fetching from smart contract:", err);
            throw err;
        }
    }, [contract, search, filterType]);

    // --- FUNGSI TOTAL COUNT TERPISAH ---
    const fetchTotalDocumentCount = useCallback(async (whereClause) => {
        const query = `
            query GetTotalDocuments {
                documents(where: ${whereClause}) {
                    id
                }
            }
        `;
        try {
            const response = await fetch(SUBGRAPH_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query })
            });
            const result = await response.json();
            return result.data?.documents?.length || 0;
        } catch (err) {
            console.error("Error fetching total document count:", err);
            return 0;
        }
    }, []);

    // --- FETCH FROM SUBGRAPH (PRIMARY) ---
    const fetchFromSubgraph = useCallback(async (currentAddress, skip, limit, whereClause) => {
        const query = `
            query GetUserDocuments($first: Int!, $skip: Int!) {
                documents(
                    where: ${whereClause}
                    first: $first
                    skip: $skip
                    orderBy: timestamp 
                    orderDirection: desc
                ) {
                    id, 
                    ipfsHash, 
                    originalFileName, 
                    timestamp, 
                    contractType, 
                    contractDate, 
                    partyA, 
                    partyAAddress, 
                    partyB, 
                    partyBAddress, 
                    isPartyASigned, 
                    isPartyBSigned
                }
            }
        `;
        
        const response = await fetch(SUBGRAPH_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, variables: { first: limit, skip: skip } })
        });
        
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const result = await response.json();
        
        if (result.errors || !result.data) {
            console.error("GraphQL Errors:", result.errors);
            throw new Error("GraphQL query failed");
        }

        const total = await fetchTotalDocumentCount(whereClause);
        
        console.log(`✅ Subgraph returned ${result.data.documents.length} documents (total: ${total})`);
        
        return { documents: result.data.documents, total };
    }, [fetchTotalDocumentCount]);

    // --- FUNGSI QUERY UTAMA (HYBRID) ---
    const fetchDocuments = useCallback(async (isManualRefresh = false) => {
        if (!isConnected || !address) {
            setState(s => ({ ...s, documents: [], totalDocuments: 0, activeCount: 0, expiredCount: 0, pendingSignatureCount: 0, loading: false, isRefreshing: false }));
            return;
        }

        // Set loading state
        if (isManualRefresh) {
            setState(s => ({ ...s, isRefreshing: true, error: null }));
        } else {
            setState(s => ({ ...s, loading: true, error: null }));
        }
        
        const skip = (currentPage - 1) * itemsPerPage;
        const currentAddress = address.toLowerCase();

        try {
            // 1. BUAT KLAUSA WHERE DINAMIS
            const whereClauseParts = [];
            whereClauseParts.push(`{ or: [{ partyAAddress: "${currentAddress}" }, { partyBAddress: "${currentAddress}" }] }`);
            
            const searchValue = search.toLowerCase().trim();
            if (searchValue) {
                if (searchValue.startsWith("qm") && searchValue.length === 46) {
                    whereClauseParts.push(`{ ipfsHash_contains_nocase: "${searchValue}" }`);
                } else if (searchValue.startsWith("0x") && searchValue.length === 42) {
                    whereClauseParts.push(`{ or: [{ partyAAddress: "${searchValue}" }, { partyBAddress: "${searchValue}" }] }`);
                } else {
                    whereClauseParts.push(`{ or: [{ originalFileName_contains_nocase: "${searchValue}" }, { partyA_contains_nocase: "${searchValue}" }, { partyB_contains_nocase: "${searchValue}" }] }`);
                }
            }
            
            if (filterType) {
                whereClauseParts.push(`{ contractType: "${filterType}" }`);
            }
            
            const whereClause = `{ and: [${whereClauseParts.join(', ')}] }`;

            // 2. HYBRID FETCH: Try Subgraph with timeout, fallback to Smart Contract
            let fetchedData;
            let dataSource = 'subgraph';

            try {
                // Race between subgraph fetch and timeout
                fetchedData = await Promise.race([
                    fetchFromSubgraph(currentAddress, skip, itemsPerPage, whereClause),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('subgraph-timeout')), SUBGRAPH_TIMEOUT)
                    )
                ]);
                
                console.log('✅ Data loaded from Subgraph');
                
            } catch (subgraphError) {
                console.warn('⚠️ Subgraph slow/unavailable, switching to blockchain...', subgraphError.message);
                
                // Show user-friendly notification only if not manual refresh
                if (!isManualRefresh) {
                    toast.info('Loading directly from blockchain...', { duration: 2000 });
                }
                
                // Fallback to smart contract
                fetchedData = await fetchFromSmartContract(currentAddress, skip, itemsPerPage);
                dataSource = 'blockchain';
                
                console.log('✅ Data loaded from Smart Contract');
            }

            // 3. Transformasi data dan PERHITUNGAN METRIK
            const today = new Date();

            const newDocuments = fetchedData.documents.map(doc => {
                const isCurrentUserPartyA = currentAddress === doc.partyAAddress.toLowerCase();
                const isCurrentUserPartyB = currentAddress === doc.partyBAddress.toLowerCase();
                const isFullySigned = doc.isPartyASigned && doc.isPartyBSigned;
                
                const expirationDateObj = doc.contractDate ? new Date(doc.contractDate) : null;
                const isExpired = expirationDateObj && expirationDateObj < today;
                
                return {
                    id: doc.id || doc.ipfsHash,
                    fileHash: doc.ipfsHash, 
                    fileName: doc.originalFileName,
                    contractType: doc.contractType,
                    partyA: doc.partyA, 
                    partyB: doc.partyB, 
                    partyAAddress: doc.partyAAddress,
                    partyBAddress: doc.partyBAddress,
                    createdAt: new Date(Number(doc.timestamp) * 1000).toISOString(),
                    expirationDate: doc.contractDate,
                    isExpired: isExpired,
                    isFullySigned: isFullySigned,
                    isPartyASigned: doc.isPartyASigned,
                    isPartyBSigned: doc.isPartyBSigned,
                    isCurrentUserPartyA,
                    isCurrentUserPartyB,
                    needsSigning: (isCurrentUserPartyA && !doc.isPartyASigned) || (isCurrentUserPartyB && !doc.isPartyBSigned)
                };
            });

            // 4. Fetch Total Metrics dari useTotalMetrics untuk konsistensi
            let activeCount = 0;
            let expiredCount = 0;
            let pendingSignatureCount = 0;
            
            try {
                const metrics = await fetchTotalMetrics(whereClause);
                activeCount = metrics.active;
                expiredCount = metrics.expired;
                pendingSignatureCount = metrics.pendingSignature;
                console.log('✅ Metrics from useTotalMetrics:', metrics);
            } catch (metricsError) {
                console.warn('⚠️ Failed to fetch metrics from useTotalMetrics, will use 0 for all metrics', metricsError);
                // Jangan hitung dari newDocuments karena itu cuma current page
                // Biarkan 0 agar user tahu ada masalah
                activeCount = 0;
                expiredCount = 0;
                pendingSignatureCount = 0;
            }

            // 5. Update State (hanya jika component masih mounted)
            if (isMountedRef.current) {
                setState(s => ({
                    ...s,
                    documents: newDocuments,
                    totalDocuments: fetchedData.total,
                    loading: false,
                    isRefreshing: false,
                    activeCount: activeCount,
                    expiredCount: expiredCount,
                    pendingSignatureCount: pendingSignatureCount,
                    dataSource: dataSource,
                }));

                // Show success toast for manual refresh
                if (isManualRefresh) {
                    toast.success('Data berhasil diperbarui!', { duration: 2000 });
                }
            }

        } catch (err) {
            console.error("❌ Error loading history:", err);
            if (isMountedRef.current) {
                toast.error("❌ Gagal memuat riwayat dokumen.");
                setState(s => ({ ...s, loading: false, isRefreshing: false, error: err.message }));
            }
        }
    }, [isConnected, address, currentPage, itemsPerPage, search, filterType, fetchFromSubgraph, fetchFromSmartContract, fetchTotalMetrics]);

    // --- MANUAL REFRESH FUNCTION ---
    const manualRefresh = useCallback(() => {
        console.log('🔄 Manual refresh triggered');
        fetchDocuments(true);
    }, [fetchDocuments]);

    // --- EVENT LISTENER: AUTO-REFRESH ON BLOCKCHAIN EVENTS ---
    useEffect(() => {
        if (!contract || !isConnected || !address) return;

        console.log('👂 Setting up event listeners...');

        // Debounced refresh untuk menghindari spam
        const debouncedRefresh = () => {
            // Clear existing timer
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }

            // Set new timer
            debounceTimerRef.current = setTimeout(() => {
                console.log('🔄 Auto-refresh triggered by blockchain event');
                toast.info('Memperbarui data kontrak...', { duration: 1500 });
                fetchDocuments(false);
            }, DEBOUNCE_DELAY);
        };

        // Event handlers
        const handleDocumentUploaded = (uploader, hash, fileName) => {
            console.log('📄 DocumentUploaded event detected:', { uploader, hash, fileName });
            debouncedRefresh();
        };

        const handleDocumentSigned = (docHash, signerAddress, partyType) => {
            console.log('✍️ DocumentSigned event detected:', { docHash, signerAddress, partyType });
            debouncedRefresh();
        };

        // Subscribe to events
        contract.on('DocumentUploaded', handleDocumentUploaded);
        contract.on('DocumentSigned', handleDocumentSigned);

        // Cleanup function
        return () => {
            console.log('🧹 Cleaning up event listeners...');
            contract.off('DocumentUploaded', handleDocumentUploaded);
            contract.off('DocumentSigned', handleDocumentSigned);
            
            // Clear debounce timer
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [contract, isConnected, address, fetchDocuments]);

    // --- FUNGSI TANDA TANGAN (SIGN) ---
    const signDocument = useCallback(async (hash, role) => {
        if (!signer || !contract) {
            toast.error("Wallet belum terhubung atau kontrak tidak siap.");
            return;
        }

        // 🆕 ID TOAST UNTUK PROGRESSIVE UPDATE
        const signToastId = `sign-tx-${hash.substring(0, 8)}`;

        try {
            // === STEP 1: TANDA TANGAN OFF-CHAIN ===
            toast.loading(`✍️ [1/3] Menandatangani dokumen sebagai Pihak ${role}...\n⏳ Mohon konfirmasi di MetaMask Anda`, { 
                id: signToastId,
                duration: Infinity,
            });
            
            const signature = await signer.signMessage(hash);
            console.log(`✏️ Signature Pihak ${role}:`, signature);

            // === STEP 2: KIRIM TRANSAKSI ON-CHAIN ===
            toast.loading(`📝 [2/3] Mengirim transaksi tanda tangan ke blockchain...\n⏳ Mohon konfirmasi di MetaMask Anda`, { 
                id: signToastId,
                duration: Infinity,
            });

            let tx;
            if (role === 'A') {
                tx = await contract.signAsPartyA(hash, signature); 
            } else {
                tx = await contract.signAsPartyB(hash, signature);
            }

            // === STEP 3: MENUNGGU KONFIRMASI ===
            toast.loading(`⛓️ [3/3] Menunggu konfirmasi blockchain...\nTX Hash: ${tx.hash.substring(0, 10)}...`, { 
                id: signToastId,
                duration: Infinity,
            });
            
            const receipt = await tx.wait();

            // === SUKSES! ===
            toast.success(`🎉 Tanda tangan berhasil!\nTX: ${receipt.hash.substring(0, 10)}...`, { 
                id: signToastId,
                duration: 8000,
                action: {
                    label: 'Lihat TX',
                    onClick: () => window.open(`https://sepolia.etherscan.io/tx/${receipt.hash}`, '_blank')
                }
            });
            
            // Event listener akan handle auto-refresh, tidak perlu manual call

        } catch (err) {
            console.error("❌ Gagal tanda tangan:", err);
            
            let errorMessage = "Gagal melakukan tanda tangan. Periksa konsol.";
            
            // Handle user rejection
            if (err.code === 4001 || err.code === 'ACTION_REJECTED' || (err.message && err.message.includes("user rejected transaction"))) {
                errorMessage = "Transaksi dibatalkan oleh pengguna di MetaMask.";
            } 
            // Handle insufficient funds
            else if (err.message && err.message.includes("insufficient funds")) {
                errorMessage = "Saldo tidak cukup untuk membayar gas fee.";
            }
            
            toast.error(`❌ ${errorMessage}`, { 
                id: signToastId,
                duration: 4000,
            });
        }
    }, [signer, contract]);

    // --- EFFECT: Trigger saat koneksi atau filter/paginasi berubah ---
    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    // --- FUNGSI SETTERS ---
    const setCurrentPage = (page) => setState(s => ({ ...s, currentPage: page }));
    const setItemsPerPage = (count) => setState(s => ({ ...s, itemsPerPage: count, currentPage: 1 }));
    const setSearch = (value) => setState(s => ({ ...s, search: value, currentPage: 1 }));
    const setFilterType = (type) => setState(s => ({ ...s, filterType: type, currentPage: 1 }));
    
    // Reset saat logout/disconnect
    useEffect(() => {
        if (!isConnected) {
            setState(initialState);
        }
    }, [isConnected]);

    // Cleanup on unmount
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    return {
        contracts: documents,
        totalDocuments,
        activeCount: state.activeCount,
        expiredCount: state.expiredCount,
        pendingSignatureCount: state.pendingSignatureCount, // NEW: Export Menunggu TTD
        loading,
        isRefreshing, // Export untuk UI
        error,
        currentPage,
        itemsPerPage,
        totalPages: Math.max(1, Math.ceil(totalDocuments / itemsPerPage)),
        dataSource: state.dataSource,
        fetchDocuments, 
        manualRefresh, // Export manual refresh function
        setCurrentPage,
        setItemsPerPage,
        setSearch,
        setFilterType,
        signDocument,
    };
};