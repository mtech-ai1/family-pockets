import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Child } from '@/entities/Child';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { createPageUrl } from '@/utils';
import { ArrowLeft } from 'lucide-react';

export default function AddChildPage() {
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !age) {
            setError('יש למלא את כל השדות.');
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            await Child.create({ name, age: parseInt(age) });
            navigate(createPageUrl('Dashboard'));
        } catch (err) {
            setError('אירעה שגיאה. נסו שוב.');
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-3 sm:p-6 lg:p-8 max-w-lg">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl font-bold">הוספת ילד חדש</h1>
                <Button variant="outline" size="icon" onClick={() => navigate(createPageUrl('Dashboard'))} className="h-8 w-8 sm:h-10 sm:w-10">
                    <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
            </div>
            <Card>
                <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-base sm:text-lg">פרטי הילד</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">מלאו את הפרטים כדי להוסיף את הילד למשפחה.</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm sm:text-base">שם</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="שם הילד"
                                className="h-10 sm:h-11 text-sm sm:text-base"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="age" className="text-sm sm:text-base">גיל</Label>
                            <Input
                                id="age"
                                type="number"
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                                placeholder="גיל הילד"
                                className="h-10 sm:h-11 text-sm sm:text-base"
                                required
                            />
                        </div>
                        {error && <p className="text-red-500 text-xs sm:text-sm">{error}</p>}
                        <Button type="submit" className="w-full h-10 sm:h-11 text-sm sm:text-base" disabled={isLoading}>
                            {isLoading ? 'מוסיף...' : 'הוספה'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}