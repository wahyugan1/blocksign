// src/components/WalletAvatar.jsx

import React, { useEffect, useState, useRef } from 'react';
import { useWallet } from '../hooks/useWallet';

/**
 * Generate Blockies-style avatar menggunakan canvas
 * Mirip dengan ethereum-blockies library
 */
const createBlockiesIcon = (address, size = 8, scale = 4) => {
  console.log('🎨 Creating blockies for:', address);
  
  const canvas = document.createElement('canvas');
  const dimension = size * scale;
  canvas.width = dimension;
  canvas.height = dimension;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error('❌ Failed to get canvas context');
    return null;
  }

  // Seed dari address
  const seed = address.toLowerCase();
  
  // Hash function sederhana untuk generate pattern
  const randseed = new Array(4);
  for (let i = 0; i < randseed.length; i++) {
    randseed[i] = 0;
  }
  
  for (let i = 0; i < seed.length; i++) {
    randseed[i % 4] = ((randseed[i % 4] << 5) - randseed[i % 4]) + seed.charCodeAt(i);
  }

  // Random number generator
  const rand = () => {
    const t = randseed[0] ^ (randseed[0] << 11);
    randseed[0] = randseed[1];
    randseed[1] = randseed[2];
    randseed[2] = randseed[3];
    randseed[3] = (randseed[3] ^ (randseed[3] >> 19) ^ t ^ (t >> 8));
    return (randseed[3] >>> 0) / ((1 << 31) >>> 0);
  };

  // Generate colors
  const createColor = () => {
    const h = Math.floor(rand() * 360);
    const s = ((rand() * 60) + 40) + '%';
    const l = ((rand() * 25) + 65) + '%';
    return `hsl(${h},${s},${l})`;
  };

  const bgColor = createColor();
  const color = createColor();
  const spotColor = createColor();

  // Fill background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, dimension, dimension);

  // Generate pattern
  const dataWidth = Math.ceil(size / 2);
  const imageData = [];
  
  for (let y = 0; y < size; y++) {
    const row = [];
    for (let x = 0; x < dataWidth; x++) {
      row[x] = Math.floor(rand() * 2.3);
    }
    imageData[y] = row;
  }

  // Draw blocks
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const val = imageData[y][x < dataWidth ? x : size - 1 - x];
      if (val) {
        ctx.fillStyle = val === 1 ? color : spotColor;
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }
    }
  }

  console.log('✅ Blockies canvas created successfully');
  return canvas;
};

const WalletAvatar = ({ size = 40, className = '' }) => {
  const walletContext = useWallet();
  const { address, ensName, provider } = walletContext;
  
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [useBlockies, setUseBlockies] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef(null);

  // Debug: Log wallet context
  useEffect(() => {
    console.log('=== WalletAvatar Debug ===');
    console.log('Address:', address);
    console.log('ENS Name:', ensName);
    console.log('Provider:', provider ? 'Available' : 'Not Available');
    console.log('Container Ref:', containerRef.current ? 'Mounted' : 'Not Mounted');
    console.log('========================');
  }, [address, ensName, provider]);

  // Load avatar (ENS or fallback)
  useEffect(() => {
    if (!address) {
      console.log('⚠️ No address, clearing avatar');
      setAvatarUrl(null);
      setUseBlockies(false);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    const loadAvatar = async () => {
      console.log('🔄 Starting avatar load process...');
      
      try {
        // Step 1: Try ENS avatar via provider
        if (ensName && provider) {
          console.log(`🔍 Step 1: Trying provider.getAvatar for ${ensName}`);
          
          try {
            const ensAvatarUrl = await provider.getAvatar(ensName);
            
            if (ensAvatarUrl && isMounted) {
              console.log(`✅ ENS Avatar found via provider: ${ensAvatarUrl}`);
              setAvatarUrl(ensAvatarUrl);
              setUseBlockies(false);
              setIsLoading(false);
              return;
            } else {
              console.log('⚠️ provider.getAvatar returned null/undefined');
            }
          } catch (ensError) {
            console.warn('⚠️ provider.getAvatar failed:', ensError.message);
          }

          // Step 2: Try ENS metadata endpoint
          console.log(`🔍 Step 2: Trying ENS metadata endpoint for ${ensName}`);
          try {
            const metadataUrl = `https://metadata.ens.domains/mainnet/avatar/${ensName}`;
            const response = await fetch(metadataUrl, { method: 'HEAD' });
            
            if (response.ok && isMounted) {
              console.log(`✅ ENS Avatar found via metadata: ${metadataUrl}`);
              setAvatarUrl(metadataUrl);
              setUseBlockies(false);
              setIsLoading(false);
              return;
            } else {
              console.log(`⚠️ Metadata endpoint returned: ${response.status}`);
            }
          } catch (metadataError) {
            console.warn('⚠️ Metadata fetch failed:', metadataError.message);
          }
        } else {
          console.log('ℹ️ No ENS name or provider, skipping ENS avatar lookup');
        }

        // Step 3: Fallback to Blockies
        if (isMounted) {
          console.log(`🖼️ Step 3: Using Blockies fallback for ${address.substring(0, 10)}...`);
          setUseBlockies(true);
          setAvatarUrl(null);
          setIsLoading(false);
        }

      } catch (error) {
        console.error('❌ Error in loadAvatar:', error);
        if (isMounted) {
          setUseBlockies(true);
          setAvatarUrl(null);
          setIsLoading(false);
        }
      }
    };

    loadAvatar();

    return () => {
      isMounted = false;
    };
  }, [address, ensName, provider]);

  // Render Blockies to canvas
  useEffect(() => {
    if (!useBlockies || !address || !containerRef.current) {
      if (useBlockies) {
        console.log('⚠️ Blockies render skipped:', {
          hasAddress: !!address,
          hasContainer: !!containerRef.current
        });
      }
      return;
    }

    console.log('🎨 Rendering Blockies to container...');

    try {
      // Clear container first
      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      }
      
      // Create and append blockies
      const icon = createBlockiesIcon(address, 8, size / 8);
      
      if (icon) {
        icon.style.display = 'block';
        icon.style.width = '100%';
        icon.style.height = '100%';
        icon.style.borderRadius = '50%';
        
        containerRef.current.appendChild(icon);
        console.log(`✅ Blockies successfully rendered to DOM`);
      } else {
        console.error('❌ createBlockiesIcon returned null');
      }
    } catch (error) {
      console.error('❌ Error rendering blockies:', error);
    }
  }, [useBlockies, address, size]);

  // Don't render if no address
  if (!address) {
    console.log('⚠️ WalletAvatar: No address, not rendering');
    return null;
  }

  console.log('🎨 WalletAvatar rendering:', { useBlockies, avatarUrl, isLoading });

  return (
    <div 
      ref={containerRef}
      className={`relative rounded-full overflow-hidden border-2 border-indigo-500/50 shadow-lg bg-gray-800 ${className}`}
      style={{ 
        width: `${size}px`, 
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
        flexShrink: 0
      }}
      title={ensName || address}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      {!useBlockies && avatarUrl && !isLoading && (
        <img 
          src={avatarUrl} 
          alt="ENS Avatar"
          className="w-full h-full object-cover"
          onLoad={() => console.log('✅ ENS image loaded successfully')}
          onError={(e) => {
            console.warn('⚠️ ENS image failed to load, switching to Blockies');
            console.error('Image error:', e);
            setUseBlockies(true);
            setAvatarUrl(null);
          }}
        />
      )}
    </div>
  );
};

export default WalletAvatar;