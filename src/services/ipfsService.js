// src/services/ipfsService.js

const PINATA_JWT = process.env.REACT_APP_PINATA_JWT;

export async function uploadToIPFS(file) {
    if (!PINATA_JWT) {
        throw new Error("❌ Pinata JWT belum dikonfigurasi. Tambahkan di file .env");
    }

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${PINATA_JWT}`,
        },
        body: formData,
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(`❌ Gagal upload ke IPFS: ${errorData.error || res.statusText}`);
    }

    const data = await res.json();
    return data.IpfsHash;
}
