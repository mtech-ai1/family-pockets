import React, { useState, useEffect, useCallback } from 'react';
import { User, Child, Transaction } from '@/entities/all';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, PiggyBank, Users, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EditChildDialog from '../components/EditChildDialog';

function ChildCard({ child, balance, onEditClick }) {
    const balanceColor = balance >= 0 ? 'text-green-600' : 'text-red-600';
    
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full"
        >
            <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative group">
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 left-2 opacity-0 sm:group-hover:opacity-100 opacity-100 sm:opacity-0 transition-opacity z-10 h-8 w-8"
                    onClick={(e) => {
                        e.preventDefault();
                        onEditClick(child);
                    }}
                >
                    <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Button>
                
                <Link to={createPageUrl(`ChildDetail?id=${child.id}`)}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 pt-3 px-4">
                        <CardTitle className="text-base sm:text-lg font-bold text-gray-800">{child.name}</CardTitle>
                        <PiggyBank className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                        <p className="text-xs sm:text-sm text-gray-500">גיל: {child.age}</p>
                        <p className="text-xl sm:text-2xl font-bold mt-1 sm:mt-2" dir="ltr">
                            <span className={balanceColor}>{balance.toFixed(2)}</span> ₪
                        </p>
                    </CardContent>
                </Link>
            </Card>
        </motion.div>
    );
}

function SetupFamily({ onFamilyNameSet }) {
    const [familyName, setFamilyName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!familyName) return;
        setLoading(true);
        await User.updateMyUserData({ family_name: familyName });
        onFamilyNameSet(familyName);
        setLoading(false);
    };

    return (
        <div className="max-w-md mx-auto mt-10 text-center">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">ברוכים הבאים!</CardTitle>
                        <p className="text-gray-500">נתחיל בהגדרת שם המשפחה שלכם</p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                placeholder="לדוגמה: משפחת ישראלי"
                                value={familyName}
                                onChange={(e) => setFamilyName(e.target.value)}
                                className="text-center"
                                required
                            />
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'יוצר...' : 'יצירת משפחה'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [childrenWithBalance, setChildrenWithBalance] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingChild, setEditingChild] = useState(null);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const navigate = useNavigate();

    const loadData = useCallback(async (currentUser) => {
        setIsLoading(true);
        if (currentUser && currentUser.family_name) {
            const children = await Child.list('-created_date');
            const transactions = await Transaction.list();
            
            const childrenBalance = children.map(child => {
                const childTransactions = transactions.filter(t => t.child_id === child.id);
                const balance = childTransactions.reduce((acc, t) => {
                    return acc + (t.type === 'income' ? t.amount : -t.amount);
                }, 0);
                return { ...child, balance };
            });
            setChildrenWithBalance(childrenBalance);
        }
        setUser(currentUser);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        User.me().then(loadData).catch(() => setIsLoading(false));
    }, [loadData]);

    const handleFamilyNameSet = (familyName) => {
        setUser(prev => ({ ...prev, family_name: familyName }));
        loadData({ ...user, family_name: familyName });
    };

    const handleEditChild = (child) => {
        setEditingChild(child);
        setShowEditDialog(true);
    };

    const handleChildUpdated = () => {
        setShowEditDialog(false);
        loadData(user);
    };

    const handleChildDeleted = () => {
        setShowEditDialog(false);
        loadData(user);
    };

    if (isLoading) {
        return (
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <Skeleton className="h-8 w-1/4 mb-6" />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
                </div>
            </div>
        );
    }

    if (!user || !user.family_name) {
        return <SetupFamily onFamilyNameSet={handleFamilyNameSet} />;
    }

    const totalBalance = childrenWithBalance.reduce((sum, child) => sum + child.balance, 0);

    return (
        <div className="container mx-auto p-3 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-8 gap-3 sm:gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">משפחת {user.family_name}</h1>
                    <p className="text-sm sm:text-base text-gray-500 mt-1">יתרה כוללת: <span className="font-bold">{totalBalance.toFixed(2)} ₪</span></p>
                </div>
                <Button onClick={() => navigate(createPageUrl('AddChild'))} className="w-full sm:w-auto">
                    <PlusCircle className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-sm sm:text-base">הוספת ילד חדש</span>
                </Button>
            </div>

            {childrenWithBalance.length === 0 ? (
                <div className="text-center py-12 sm:py-16 border-2 border-dashed rounded-xl">
                    <Users className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
                    <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-medium">עדיין אין ילדים</h3>
                    <p className="mt-1 text-xs sm:text-sm text-gray-500">התחילו בהוספת הילד הראשון שלכם למערכת.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                    <AnimatePresence>
                        {childrenWithBalance.map(child => (
                            <ChildCard 
                                key={child.id} 
                                child={child} 
                                balance={child.balance}
                                onEditClick={handleEditChild}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            )}

            <EditChildDialog
                child={editingChild}
                isOpen={showEditDialog}
                onOpenChange={setShowEditDialog}
                onChildUpdated={handleChildUpdated}
                onChildDeleted={handleChildDeleted}
            />
        </div>
    );
}