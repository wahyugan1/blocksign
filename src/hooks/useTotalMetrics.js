// File: hooks/useTotalMetrics.js

import { useCallback } from 'react';

// --- KONFIGURASI SUBGRAPH ---
const SUBGRAPH_URL = "https://api.studio.thegraph.com/query/118167/kontrakdigital/version/latest";

// Fungsi utilitas untuk menentukan status kadaluarsa
const checkExpiration = (contractDate) => {
    if (!contractDate) return false;
    const expirationDate = new Date(contractDate);
    const today = new Date();
    return expirationDate < today;
};

/**
 * Mengambil hitungan total dokumen dengan metrik baru:
 * - active: Kontrak yang sudah diupload dan belum kadaluarsa (tidak peduli TTD)
 * - expired: Kontrak yang sudah kadaluarsa
 * - pendingSignature: Kontrak yang belum TTD lengkap dan belum kadaluarsa
 */
export const useTotalMetrics = () => {

    const fetchTotalMetrics = useCallback(async (whereClause) => {
        const rawQuery = `
            query GetAllUserDocuments {
                documents(
                    where: ${whereClause}
                    orderBy: timestamp 
                    orderDirection: desc
                ) {
                    contractDate, 
                    isPartyASigned, 
                    isPartyBSigned
                }
            }
        `;
        const query = rawQuery.replace(/\u00A0/g, ' ').trim(); 

        try {
            const response = await fetch(SUBGRAPH_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query })
            });
            
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            const result = await response.json();

            if (result.errors || !result.data) {
                console.error("GraphQL Errors (Metrics):", result.errors);
                return { active: 0, expired: 0, pendingSignature: 0 };
            }

            let activeCount = 0;
            let expiredCount = 0;
            let pendingSignatureCount = 0;

            // Hitung metrik dari SEMUA data Subgraph
            result.data.documents.forEach(doc => {
                const isExpired = checkExpiration(doc.contractDate);
                const isFullySigned = doc.isPartyASigned && doc.isPartyBSigned;
                
                if (isExpired) {
                    // Kontrak Kadaluarsa
                    expiredCount++;
                } else {
                    // Kontrak belum kadaluarsa
                    activeCount++; // Semua yang belum kadaluarsa = Aktif
                    
                    if (!isFullySigned) {
                        // Belum TTD lengkap = Menunggu TTD
                        pendingSignatureCount++;
                    }
                }
            });

            console.log(`📊 Total Metrics - Active: ${activeCount}, Expired: ${expiredCount}, Pending Signature: ${pendingSignatureCount}`);

            return { 
                active: activeCount, 
                expired: expiredCount, 
                pendingSignature: pendingSignatureCount 
            };

        } catch (err) {
            console.error("❌ Kesalahan fetching metrik total dokumen:", err);
            return { active: 0, expired: 0, pendingSignature: 0 };
        }
    }, []);

    return { fetchTotalMetrics };
};