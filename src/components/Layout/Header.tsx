import { ReactNode } from 'react';

interface HeaderProps {
    title: string;
    children?: ReactNode;
    onMenuClick: () => void;
}

const Header = ({ title, children, onMenuClick }: HeaderProps) => {
    return (
        <header className="glass rounded-xl p-4 mb-8 flex items-center justify-between sticky top-4 z-20">
            <div className="flex items-center gap-4">
                <button onClick={onMenuClick} className="lg:hidden text-gray-400 hover:text-white transition-colors">
                    ☰
                </button>
                <h1 className="text-2xl font-bold">{title}</h1>
            </div>
            <div className="flex items-center gap-4">
                {children}
            </div>
        </header>
    );
};

export default Header;
