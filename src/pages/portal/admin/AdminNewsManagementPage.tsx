import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/lib/authStore';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Trash2, Edit, PlusCircle } from 'lucide-react';

type NewsCategory = {
  id: string;
  name: string;
};

type NewsItem = {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  author: string;
  date: string;
};

const initialCategories: NewsCategory[] = [
  { id: 'cat1', name: 'Pengumuman' },
  { id: 'cat2', name: 'Kegiatan' },
  { id: 'cat3', name: 'Prestasi' },
];

const initialNews: NewsItem[] = [
  { id: 'news1', title: 'Perayaan Hari Pendidikan Nasional', content: 'Sekolah kami merayakan Hari Pendidikan Nasional dengan berbagai kegiatan seru.', categoryId: 'cat2', author: 'Admin Sekolah', date: new Date('2024-05-02').toISOString() },
  { id: 'news2', title: 'Prestasi Siswa di Olimpiade Sains', content: 'Tim sains sekolah berhasil meraih juara dalam Olimpiade Sains tingkat provinsi.', categoryId: 'cat3', author: 'Admin Sekolah', date: new Date('2024-04-15').toISOString() },
];

export function AdminNewsManagementPage() {
  const user = useAuthStore((state) => state.user);
  const [categories, setCategories] = useState<NewsCategory[]>(initialCategories);
  const [newsItems, setNewsItems] = useState<NewsItem[]>(initialNews);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const handlePostNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim() || !newCategory || !user) {
      toast.error('Title, content, and category cannot be empty.');
      return;
    }
    
    const newNewsItem: NewsItem = {
      id: `news-${crypto.randomUUID()}`,
      title: newTitle,
      content: newContent,
      categoryId: newCategory,
      author: user.name || 'Unknown Author',
      date: new Date().toISOString(),
    };
    
    setNewsItems([newNewsItem, ...newsItems]);
    setNewTitle('');
    setNewContent('');
    setNewCategory('');
    toast.success('News posted successfully!');
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      toast.error('Category name cannot be empty.');
      return;
    }
    
    const newCat: NewsCategory = {
      id: `cat-${crypto.randomUUID()}`,
      name: newCategoryName,
    };
    
    setCategories([...categories, newCat]);
    setNewCategoryName('');
    setIsAddingCategory(false);
    toast.success('Category added successfully!');
  };

  const handleDeleteNews = (id: string) => {
    setNewsItems(newsItems.filter(news => news.id !== id));
    toast.success('News deleted.');
  };

  const handleDeleteCategory = (id: string) => {
    // Check if any news item is using this category
    const isUsed = newsItems.some(news => news.categoryId === id);
    if (isUsed) {
      toast.error('Cannot delete category that is being used by news items.');
      return;
    }
    
    setCategories(categories.filter(cat => cat.id !== id));
    toast.success('Category deleted.');
  };

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach(cat => map.set(cat.id, cat.name));
    return map;
  }, [categories]);

  const getCategoryName = (categoryId: string) => {
    return categoryMap.get(categoryId) || 'Unknown';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h1 className="text-3xl font-bold">Manage News</h1>
      
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create News</CardTitle>
              <CardDescription>Post a new school news item.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePostNews} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="News Title" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <div className="flex space-x-2">
                    <Select value={newCategory} onValueChange={setNewCategory}>
                      <SelectTrigger className="flex-grow"><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button type="button" variant="outline" size="icon" onClick={() => setIsAddingCategory(!isAddingCategory)}>
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </div>
                  {isAddingCategory && (
                    <div className="mt-2 flex space-x-2">
                      <Input 
                        value={newCategoryName} 
                        onChange={(e) => setNewCategoryName(e.target.value)} 
                        placeholder="New category name" 
                      />
                      <Button type="button" onClick={handleAddCategory}>Add</Button>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea id="content" value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="Write your news content here..." rows={5} />
                </div>
                <Button type="submit" className="w-full">Post News</Button>
              </form>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Manage Categories</CardTitle>
              <CardDescription>Add or remove news categories.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categories.map(category => (
                  <div key={category.id} className="flex justify-between items-center">
                    <span>{category.name}</span>
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="h-8 w-8" 
                      onClick={() => handleDeleteCategory(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Posted News</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {newsItems.length > 0 ? (
                newsItems.map((news, index) => (
                  <div key={news.id}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{news.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          By {news.author} on {format(new Date(news.date), 'PPP')} in {getCategoryName(news.categoryId)}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" disabled>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleDeleteNews(news.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="mt-2 text-sm">{news.content}</p>
                    {index < newsItems.length - 1 && <Separator className="mt-6" />}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No news posted yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}