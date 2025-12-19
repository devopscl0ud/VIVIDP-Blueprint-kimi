import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export interface LayoutContextType {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

const MainLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="font-sans text-slate-50 antialiased min-h-screen bg-deep-space">
            {/* Global Background Effects could go here if they are truly global and static. 
                 However, some pages (like Landing) might differ. 
                 But for the App ("Dashboard" area), these are consistent.
             */}
            <div className="circuit-bg fixed inset-0 z-[-2]"></div>
            <div className="fixed inset-0 z-[-1] opacity-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main className="lg:ml-[280px] p-6 min-h-screen transition-all duration-300">
                <Outlet context={{ sidebarOpen, setSidebarOpen } satisfies LayoutContextType} />
            </main>
        </div>
    );
};

export default MainLayout;
