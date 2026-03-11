import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Clock, AlertCircle, CheckCircle2, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Note {
  id: string;
  title: string;
  description: string;
  time: string;
  date: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: number;
  reminderSent?: boolean;
}

export default function SmartNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    time: '',
    date: new Date().toISOString().split('T')[0],
    priority: 'medium' as 'low' | 'medium' | 'high',
  });

  // Load notes from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('smart-notes');
    if (saved) {
      try {
        setNotes(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load notes:', e);
      }
    }
  }, []);

  // Save notes to localStorage
  useEffect(() => {
    localStorage.setItem('smart-notes', JSON.stringify(notes));
  }, [notes]);

  // Check for reminders every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const currentDate = now.toISOString().split('T')[0];

      notes.forEach((note) => {
        if (
          !note.reminderSent &&
          !note.completed &&
          note.date === currentDate &&
          note.time === currentTime
        ) {
          // Send notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('تنبيه ذكي', {
              body: `⏰ حان الوقت: ${note.title}\n${note.description}`,
              icon: '🔔',
              tag: `note-${note.id}`,
            });
          }

          // Mark reminder as sent
          setNotes((prev) =>
            prev.map((n) =>
              n.id === note.id ? { ...n, reminderSent: true } : n
            )
          );

          toast.success(`تنبيه: ${note.title}`);
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [notes]);

  const handleAddNote = () => {
    if (!formData.title.trim() || !formData.time) {
      toast.error('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    if (editingId) {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === editingId
            ? {
                ...n,
                ...formData,
                reminderSent: false,
              }
            : n
        )
      );
      setEditingId(null);
      toast.success('تم تحديث الملاحظة');
    } else {
      const newNote: Note = {
        id: Date.now().toString(),
        ...formData,
        completed: false,
        createdAt: Date.now(),
      };
      setNotes((prev) => [newNote, ...prev]);
      toast.success('تمت إضافة الملاحظة');
    }

    setFormData({
      title: '',
      description: '',
      time: '',
      date: new Date().toISOString().split('T')[0],
      priority: 'medium',
    });
    setIsOpen(false);
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    toast.success('تم حذف الملاحظة');
  };

  const handleToggleComplete = (id: string) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, completed: !n.completed } : n
      )
    );
  };

  const handleEditNote = (note: Note) => {
    setFormData({
      title: note.title,
      description: note.description,
      time: note.time,
      date: note.date,
      priority: note.priority,
    });
    setEditingId(note.id);
    setIsOpen(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-500/30 bg-red-500/5';
      case 'medium':
        return 'border-yellow-500/30 bg-yellow-500/5';
      case 'low':
        return 'border-green-500/30 bg-green-500/5';
      default:
        return 'border-border/50 bg-card';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '⚪';
    }
  };

  const sortedNotes = [...notes].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return b.createdAt - a.createdAt;
  });

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between px-4 mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">ملاحظاتي الذكية</h2>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({
              title: '',
              description: '',
              time: '',
              date: new Date().toISOString().split('T')[0],
              priority: 'medium',
            });
            setIsOpen(!isOpen);
          }}
          className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {/* Add/Edit Note Form */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 mb-4 overflow-hidden"
          >
            <div className="rounded-2xl bg-card border border-border/50 p-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                  العنوان
                </label>
                <input
                  type="text"
                  placeholder="مثال: اجتماع مهم"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                  الوصف (اختياري)
                </label>
                <textarea
                  placeholder="أضف تفاصيل إضافية..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                    التاريخ
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                    الوقت
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-2 block">
                  الأولوية
                </label>
                <div className="flex gap-2">
                  {['low', 'medium', 'high'].map((p) => (
                    <button
                      key={p}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          priority: p as 'low' | 'medium' | 'high',
                        })
                      }
                      className={cn(
                        'flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition-all',
                        formData.priority === p
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background border border-border/50 text-foreground'
                      )}
                    >
                      {p === 'low' ? '🟢 منخفضة' : p === 'medium' ? '🟡 متوسطة' : '🔴 عالية'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleAddNote}
                  className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground font-bold transition-all active:scale-95"
                >
                  {editingId ? 'تحديث' : 'إضافة'}
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setEditingId(null);
                  }}
                  className="flex-1 py-2.5 rounded-lg bg-background border border-border/50 text-foreground font-bold transition-all active:scale-95"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notes List */}
      <div className="px-4 space-y-2">
        {sortedNotes.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">لا توجد ملاحظات حالياً</p>
          </div>
        ) : (
          sortedNotes.map((note) => (
            <motion.div
              key={note.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={cn(
                'rounded-2xl border p-3 transition-all',
                getPriorityColor(note.priority),
                note.completed && 'opacity-60'
              )}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => handleToggleComplete(note.id)}
                  className="mt-0.5 flex-shrink-0"
                >
                  {note.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-foreground/30" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p
                        className={cn(
                          'font-bold text-foreground',
                          note.completed && 'line-through text-muted-foreground'
                        )}
                      >
                        {getPriorityIcon(note.priority)} {note.title}
                      </p>
                      {note.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {note.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{note.time}</span>
                    <span>•</span>
                    <span>{note.date}</span>
                  </div>
                </div>

                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleEditNote(note)}
                    className="p-1.5 rounded-lg hover:bg-background/50 transition-colors"
                  >
                    <Edit2 className="h-4 w-4 text-foreground/60" />
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4 text-red-500/60" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
