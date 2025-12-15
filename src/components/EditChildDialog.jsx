import React, { useState } from 'react';
import { Child } from '@/entities/Child';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Edit3, Trash2 } from 'lucide-react';

export default function EditChildDialog({ child, isOpen, onOpenChange, onChildUpdated, onChildDeleted }) {
    const [name, setName] = useState(child?.name || '');
    const [age, setAge] = useState(child?.age?.toString() || '');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    React.useEffect(() => {
        if (child) {
            setName(child.name);
            setAge(child.age.toString());
        }
    }, [child]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!name || !age) {
            setError('יש למלא את כל השדות.');
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            await Child.update(child.id, { name, age: parseInt(age) });
            onChildUpdated();
            onOpenChange(false);
        } catch (err) {
            setError('אירעה שגיאה בעדכון. נסו שוב.');
        }
        setIsLoading(false);
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await Child.delete(child.id);
            onChildDeleted();
            setShowDeleteDialog(false);
            onOpenChange(false);
        } catch (err) {
            setError('אירעה שגיאה במחיקה. נסו שוב.');
        }
        setIsDeleting(false);
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className="w-[calc(100%-2rem)] sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                            <Edit3 className="w-4 h-4 sm:w-5 sm:h-5" />
                            עריכת פרטי {child?.name}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdate} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name" className="text-sm sm:text-base">שם</Label>
                            <Input
                                id="edit-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="שם הילד"
                                className="h-10 sm:h-11 text-sm sm:text-base"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-age" className="text-sm sm:text-base">גיל</Label>
                            <Input
                                id="edit-age"
                                type="number"
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                                placeholder="גיל הילד"
                                className="h-10 sm:h-11 text-sm sm:text-base"
                                required
                            />
                        </div>
                        {error && <p className="text-red-500 text-xs sm:text-sm">{error}</p>}
                        <DialogFooter className="flex-col sm:flex-row gap-2">
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={() => setShowDeleteDialog(true)}
                                className="flex items-center gap-2 w-full sm:w-auto text-sm sm:text-base h-10 sm:h-11"
                            >
                                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                מחיקה
                            </Button>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <DialogClose asChild>
                                    <Button variant="outline" className="flex-1 sm:flex-none text-sm sm:text-base h-10 sm:h-11">ביטול</Button>
                                </DialogClose>
                                <Button type="submit" disabled={isLoading} className="flex-1 sm:flex-none text-sm sm:text-base h-10 sm:h-11">
                                    {isLoading ? 'מעדכן...' : 'עדכון'}
                                </Button>
                            </div>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent className="w-[calc(100%-2rem)] sm:max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-base sm:text-lg">מחיקת {child?.name}</AlertDialogTitle>
                        <AlertDialogDescription className="text-xs sm:text-sm">
                            האם אתם בטוחים שברצונכם למחוק את {child?.name}?
                            <br />
                            <strong className="text-red-600">פעולה זו תמחק גם את כל היסטוריית הפעולות של הילד ולא ניתנת לביטול.</strong>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                        <AlertDialogCancel className="w-full sm:w-auto text-sm sm:text-base h-10 sm:h-11 m-0">ביטול</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700 w-full sm:w-auto text-sm sm:text-base h-10 sm:h-11"
                        >
                            {isDeleting ? 'מוחק...' : 'מחיקה'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}