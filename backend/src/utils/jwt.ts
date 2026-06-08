import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

let client: jwksClient.JwksClient | null = null;

const getJwksClient = () => {
  if (!client) {
    if (!process.env.SUPABASE_URL) {
      throw new Error('SUPABASE_URL is not defined in environment variables');
    }
    client = jwksClient({
      jwksUri: `${process.env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`,
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 10
    });
  }
  return client;
};

/**
 * Key retrieval function for jsonwebtoken.
 * Supports both modern ES256 (via JWKS) and legacy HS256 (via local secret).
 */
const getKey = (header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) => {
  // If it's a legacy token using HS256, use the local JWT_SECRET
  if (header.alg === 'HS256') {
    return callback(null, process.env.JWT_SECRET!);
  }

  // Otherwise, use JWKS to fetch the public key (e.g. for ES256)
  if (!header.kid) {
    return callback(new Error('Missing kid in JWT header for asymmetric algorithm'));
  }

  try {
    const jwks = getJwksClient();
    jwks.getSigningKey(header.kid, (err, key) => {
      if (err) return callback(err);
      const signingKey = key?.getPublicKey();
      callback(null, signingKey);
    });
  } catch (err: any) {
    callback(err);
  }
};

/**
 * Promisified JWT verification
 */
export const verifyToken = (token: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getKey,
      { algorithms: ['HS256', 'ES256'] },
      (err, decoded) => {
        if (err) return reject(err);
        resolve(decoded);
      }
    );
  });
};
