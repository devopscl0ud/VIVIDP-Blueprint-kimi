import { useState, useEffect, useCallback } from 'react';

interface DeploymentStatus {
    status: string;
    reason: string;
    ready: boolean;
}

interface UseDeploymentStatusOptions {
    namespace: string;
    appName: string;
    enabled?: boolean;
    pollInterval?: number;
    onStatusChange?: (status: DeploymentStatus) => void;
}

/**
 * Custom hook for polling deployment status
 * Polls the backend at regular intervals until the deployment is ready or an error occurs
 */
export function useDeploymentStatus({
    namespace,
    appName,
    enabled = true,
    pollInterval = 5000,
    onStatusChange
}: UseDeploymentStatusOptions) {
    const [status, setStatus] = useState<DeploymentStatus | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStatus = useCallback(async () => {
        if (!namespace || !appName) return;

        try {
            setLoading(true);
            const token = localStorage.getItem('supabase.auth.token');

            const response = await fetch(`/api/status/${namespace}/${appName}`, {
                headers: {
                    'Authorization': token ? `Bearer ${JSON.parse(token).access_token}` : ''
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch status');
            }

            const data: DeploymentStatus = await response.json();
            setStatus(data);
            setError(null);

            if (onStatusChange) {
                onStatusChange(data);
            }

            return data;
        } catch (err: any) {
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, [namespace, appName, onStatusChange]);

    useEffect(() => {
        if (!enabled || !namespace || !appName) return;

        // Initial fetch
        fetchStatus();

        // Set up polling
        const interval = setInterval(() => {
            // Stop polling if deployment is ready or in error state
            if (status?.ready || status?.status === 'ErrImagePull' || status?.status === 'CrashLoopBackOff') {
                return;
            }
            fetchStatus();
        }, pollInterval);

        return () => clearInterval(interval);
    }, [enabled, namespace, appName, pollInterval, fetchStatus, status?.ready, status?.status]);

    return {
        status,
        loading,
        error,
        refetch: fetchStatus
    };
}

export default useDeploymentStatus;
