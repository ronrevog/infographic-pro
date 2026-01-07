import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    User,
    signInWithPopup,
    signOut as firebaseSignOut,
    onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    apiKey: string | null;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ALLOWED_DOMAIN = 'complex.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Fetch API key from Firestore when user is authenticated
    const fetchApiKey = async () => {
        try {
            const configDoc = await getDoc(doc(db, 'config', 'api'));
            if (configDoc.exists()) {
                const data = configDoc.data();
                setApiKey(data.geminiApiKey || null);
            } else {
                console.warn('API config document not found in Firestore');
                setApiKey(null);
            }
        } catch (err) {
            console.error('Error fetching API key:', err);
            setApiKey(null);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Verify email domain
                const email = firebaseUser.email || '';
                const domain = email.split('@')[1];

                if (domain === ALLOWED_DOMAIN) {
                    setUser(firebaseUser);
                    setError(null);
                    await fetchApiKey();
                } else {
                    // Sign out user with wrong domain
                    await firebaseSignOut(auth);
                    setUser(null);
                    setApiKey(null);
                    setError(`Access denied. Only @${ALLOWED_DOMAIN} emails are allowed.`);
                }
            } else {
                setUser(null);
                setApiKey(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        setError(null);
        setLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const email = result.user.email || '';
            const domain = email.split('@')[1];

            if (domain !== ALLOWED_DOMAIN) {
                await firebaseSignOut(auth);
                setError(`Access denied. Only @${ALLOWED_DOMAIN} emails are allowed.`);
            }
        } catch (err: any) {
            console.error('Sign in error:', err);
            if (err.code === 'auth/popup-closed-by-user') {
                setError('Sign-in was cancelled.');
            } else if (err.code === 'auth/unauthorized-domain') {
                setError('This domain is not authorized for sign-in. Please contact your administrator.');
            } else {
                setError(err.message || 'Failed to sign in.');
            }
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
            setUser(null);
            setApiKey(null);
            setError(null);
        } catch (err: any) {
            console.error('Sign out error:', err);
            setError(err.message || 'Failed to sign out.');
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, apiKey, signInWithGoogle, signOut, error }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
