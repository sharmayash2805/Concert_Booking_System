import { useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { concerts as initialConcerts, Concert } from "@/data/mockData";
import { toast } from "sonner";

const Admin = () => {
  const [events, setEvents] = useState<Concert[]>(initialConcerts);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", artist: "", date: "", venue: "", city: "", price: "" });

  const resetForm = () => {
    setForm({ title: "", artist: "", date: "", venue: "", city: "", price: "" });
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (concert: Concert) => {
    setForm({ title: concert.title, artist: concert.artist, date: concert.date, venue: concert.venue, city: concert.city, price: String(concert.price) });
    setEditing(concert.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    toast.success("Event deleted");
  };

  const handleSave = () => {
    if (!form.title || !form.artist) {
      toast.error("Please fill in required fields");
      return;
    }
    if (editing) {
      setEvents((prev) => prev.map((e) => e.id === editing ? { ...e, ...form, price: Number(form.price) } : e));
      toast.success("Event updated");
    } else {
      const newEvent: Concert = {
        id: String(Date.now()),
        ...form,
        price: Number(form.price),
        time: "8:00 PM",
        image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
        description: "New event",
        totalSeats: 60,
        bookedSeats: [],
      };
      setEvents((prev) => [...prev, newEvent]);
      toast.success("Event added");
    }
    resetForm();
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage events and seat availability</p>
          </div>
          <Button variant="neon" onClick={() => { resetForm(); setShowForm(true); }} className="gap-2">
            <Plus className="w-4 h-4" /> Add Event
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="glass rounded-2xl p-6 animate-scale-in space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-foreground">{editing ? "Edit Event" : "Add New Event"}</h2>
              <Button variant="ghost" size="icon" onClick={resetForm}><X className="w-4 h-4" /></Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: "title", label: "Title", type: "text" },
                { key: "artist", label: "Artist", type: "text" },
                { key: "date", label: "Date", type: "date" },
                { key: "venue", label: "Venue", type: "text" },
                { key: "city", label: "City", type: "text" },
                { key: "price", label: "Price ($)", type: "number" },
              ].map(({ key, label, type }) => (
                <div key={key} className="space-y-1">
                  <Label>{label}</Label>
                  <Input
                    type={type}
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                    className="bg-secondary border-border/50"
                  />
                </div>
              ))}
            </div>
            <Button variant="neon" onClick={handleSave}>{editing ? "Update" : "Create"} Event</Button>
          </div>
        )}

        {/* Table */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  {["Event", "Artist", "Date", "Venue", "Price", "Seats", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{event.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">{event.artist}</td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(event.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-muted-foreground">{event.venue}</td>
                    <td className="px-4 py-3 font-medium text-foreground">${event.price}</td>
                    <td className="px-4 py-3">
                      <span className="text-accent">{event.totalSeats - event.bookedSeats.length}</span>
                      <span className="text-muted-foreground">/{event.totalSeats}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(event)} className="h-8 w-8 hover:text-primary">
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(event.id)} className="h-8 w-8 hover:text-destructive">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
