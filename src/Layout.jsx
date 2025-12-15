import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, Users } from 'lucide-react';

export default function Layout({ children, currentPageName }) {
    const location = useLocation();

    return (
        <div dir="rtl" className="min-h-screen bg-gray-50 font-sans text-gray-800">
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <nav className="container mx-auto px-3 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-14 sm:h-16">
                        <Link to={createPageUrl('Dashboard')} className="flex items-center gap-1.5 sm:gap-2">
                            <img src="/logo.svg" alt="לוגו" className="h-6 w-6 sm:h-8 sm:w-8" />
                            <span className="text-lg sm:text-xl font-bold text-blue-600">דמי כיס</span>
                        </Link>
                        <div className="flex items-center gap-1 sm:gap-4">
                            <Link to={createPageUrl('Dashboard')} className={`flex items-center gap-1 sm:gap-2 p-2 rounded-md transition-colors ${location.pathname === createPageUrl('Dashboard') ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-100'}`}>
                                <Home className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="hidden sm:inline text-sm">לוח בקרה</span>
                            </Link>
                            <Link to={createPageUrl('AddChild')} className={`flex items-center gap-1 sm:gap-2 p-2 rounded-md transition-colors ${location.pathname === createPageUrl('AddChild') ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-100'}`}>
                                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="hidden sm:inline text-sm">הוספת ילד</span>
                            </Link>
                        </div>
                    </div>
                </nav>
            </header>
            <main>
                {children}
            </main>
        </div>
    );
}