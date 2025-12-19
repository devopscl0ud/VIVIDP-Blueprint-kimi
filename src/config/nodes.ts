// Node IP Configuration for VividP
// These are the external IPs of your Kubernetes worker nodes
// Used for displaying NodePort service access URLs

export const NODE_CONFIG = {
    nodes: [
        {
            name: 'k8s-worker1',
            internalIP: '10.128.0.22',
            externalIP: '136.113.65.16',
            zone: 'us-central1-a',
            roles: ['worker']
        },
        {
            name: 'k8s-worker2',
            internalIP: '10.128.0.21',
            externalIP: '34.58.110.43',
            zone: 'us-central1-a',
            roles: ['worker']
        },
        {
            name: 'k8s-master',
            internalIP: '10.128.0.20',
            externalIP: null, // Control plane, not for workloads
            zone: 'us-central1-a',
            roles: ['control-plane']
        }
    ],
    // Get external IP for a node by name
    getExternalIP: function (nodeName: string): string | null {
        const node = this.nodes.find(n => n.name === nodeName);
        return node?.externalIP || null;
    },
    // Get all worker external IPs
    getWorkerExternalIPs: function (): string[] {
        return this.nodes
            .filter(n => n.roles.includes('worker') && n.externalIP)
            .map(n => n.externalIP as string);
    }
};

export default NODE_CONFIG;
