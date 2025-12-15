import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Child, Transaction } from '@/entities/all';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Minus, ArrowLeft, ArrowUp, ArrowDown, Settings } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import EditChildDialog from '../components/EditChildDialog';

function TransactionForm({ childId, type, onTransactionAdded }) {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!amount || !description) return;
        setIsLoading(true);
        await Transaction.create({
            child_id: childId,
            type,
            amount: parseFloat(amount),
            description,
        });
        setIsLoading(false);
        setAmount('');
        setDescription('');
        onTransactionAdded();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="amount">סכום (₪)</Label>
                <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="description">תיאור</Label>
                <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={type === 'income' ? 'לדוגמה: מתנה מסבתא' : 'לדוגמה: קניית ממתקים'}
                    required
                />
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">ביטול</Button>
                </DialogClose>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'מעדכן...' : 'הוספה'}
                </Button>
            </DialogFooter>
        </form>
    );
}

export default function ChildDetailPage() {
    const navigate = useNavigate();
    const [child, setChild] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [balance, setBalance] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formType, setFormType] = useState('income');
    const [showEditDialog, setShowEditDialog] = useState(false);

    // Get child ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const childId = urlParams.get('id');

    const loadData = useCallback(async () => {
        if (!childId) {
            setIsLoading(false);
            return;
        }
        
        setIsLoading(true);
        try {
            const childData = await Child.get(childId);
            const transactionData = await Transaction.filter({ child_id: childId }, '-created_date');
            
            const currentBalance = transactionData.reduce((acc, t) => {
                return acc + (t.type === 'income' ? t.amount : -t.amount);
            }, 0);

            setChild(childData);
            setTransactions(transactionData);
            setBalance(currentBalance);
        } catch (error) {
            console.error('Error loading data:', error);
        }
        setIsLoading(false);
    }, [childId]);

    useEffect(() => {
        loadData();
    }, [loadData]);
    
    const handleTransactionAdded = () => {
        setIsFormOpen(false);
        loadData();
    };
    
    const openForm = (type) => {
        setFormType(type);
        setIsFormOpen(true);
    };

    const handleChildUpdated = () => {
        loadData();
    };

    const handleChildDeleted = () => {
        navigate(createPageUrl('Dashboard'));
    };

    if (isLoading) {
        return (
            <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl">
                <Skeleton className="h-8 w-1/3 mb-4" />
                <Skeleton className="h-24 w-full mb-6" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (!child) {
        return (
            <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl text-center">
                <h1 className="text-2xl font-bold mb-4">ילד לא נמצא</h1>
                <Button onClick={() => navigate(createPageUrl('Dashboard'))}>
                    <ArrowLeft className="ml-2 h-4 w-4" />
                    חזרה לדף הבית
                </Button>
            </div>
        );
    }

    const balanceColor = balance >= 0 ? 'text-green-600' : 'text-red-600';

    return (
        <div className="container mx-auto p-3 sm:p-6 lg:p-8 max-w-4xl">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">הקופה של {child.name}</h1>
                <div className="flex gap-1 sm:gap-2">
                    <Button variant="outline" size="icon" onClick={() => setShowEditDialog(true)} className="h-8 w-8 sm:h-10 sm:w-10">
                        <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => navigate(createPageUrl('Dashboard'))} className="h-8 w-8 sm:h-10 sm:w-10">
                        <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Button>
                </div>
            </div>

            <Card className="mb-4 sm:mb-6 bg-blue-50 border-blue-200">
                <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-base sm:text-lg text-blue-800">יתרה נוכחית</CardTitle>
                </CardHeader>
                <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                    <p className={`text-3xl sm:text-4xl md:text-5xl font-bold ${balanceColor}`} dir="ltr">{balance.toFixed(2)} ₪</p>
                </CardContent>
                <CardFooter className="gap-2 sm:gap-3 p-4 sm:p-6 pt-0">
                    <Dialog open={isFormOpen && formType === 'income'} onOpenChange={(open) => setIsFormOpen(open && formType === 'income')}>
                        <DialogTrigger asChild>
                            <Button className="bg-green-500 hover:bg-green-600 flex-1 text-sm sm:text-base h-10 sm:h-11" onClick={() => openForm('income')}>
                                <Plus className="ml-1 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5" /> הכנסה
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>הכנסה חדשה</DialogTitle>
                            </DialogHeader>
                            <TransactionForm childId={childId} type="income" onTransactionAdded={handleTransactionAdded} />
                        </DialogContent>
                    </Dialog>
                    
                    <Dialog open={isFormOpen && formType === 'expense'} onOpenChange={(open) => setIsFormOpen(open && formType === 'expense')}>
                        <DialogTrigger asChild>
                            <Button variant="destructive" className="flex-1 text-sm sm:text-base h-10 sm:h-11" onClick={() => openForm('expense')}>
                                <Minus className="ml-1 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5" /> הוצאה
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>הוצאה חדשה</DialogTitle>
                            </DialogHeader>
                            <TransactionForm childId={childId} type="expense" onTransactionAdded={handleTransactionAdded} />
                        </DialogContent>
                    </Dialog>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-base sm:text-lg">היסטוריית פעולות</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                    {transactions.length === 0 ? (
                        <p className="text-gray-500 text-center py-6 sm:py-8 text-sm sm:text-base">אין עדיין פעולות בחשבון.</p>
                    ) : (
                        <ul className="space-y-3 sm:space-y-4">
                            {transactions.map(t => (
                                <li key={t.id} className="flex items-start sm:items-center justify-between p-3 bg-gray-50 rounded-lg gap-2">
                                    <div className="flex items-start sm:items-center gap-2 sm:gap-4 flex-1 min-w-0">
                                        <div className={`p-1.5 sm:p-2 rounded-full flex-shrink-0 ${t.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                            {t.type === 'income' ? <ArrowDown className="w-4 h-4 sm:w-5 sm:h-5" /> : <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5" />}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-semibold text-sm sm:text-base truncate">{t.description}</p>
                                            <p className="text-xs sm:text-sm text-gray-500">{format(new Date(t.created_date), 'd MMMM yyyy, HH:mm', { locale: he })}</p>
                                        </div>
                                    </div>
                                    <p className={`font-bold text-base sm:text-lg flex-shrink-0 ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`} dir="ltr">
                                        {t.type === 'income' ? '+' : '-'}{t.amount.toFixed(2)} ₪
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>

            <EditChildDialog
                child={child}
                isOpen={showEditDialog}
                onOpenChange={setShowEditDialog}
                onChildUpdated={handleChildUpdated}
                onChildDeleted={handleChildDeleted}
            />
        </div>
    );
}