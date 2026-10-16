import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateEvent, useDeleteEvent, useEvents, useUpdateEvent } from "@/hooks/useApi";
import type { ConcertEvent, EventRequest } from "@/lib/api";
import { toast } from "sonner";
import Glyph from "@/components/Glyph";

interface EventForm {
  title: string;
  description: string;
  venue: string;
  dateTime: string;
}

const emptyForm: EventForm = { title: "", description: "", venue: "", dateTime: "" };

const Admin = () => {
  const { data: events = [], isLoading, isError, refetch } = useEvents();
  const createMutation = useCreateEvent();
  const updateMutation = useUpdateEvent();
  const deleteMutation = useDeleteEvent();
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ConcertEvent | null>(null);
  const [form, setForm] = useState<EventForm>(emptyForm);
  const saving = createMutation.isPending || updateMutation.isPending;

  const resetForm = () => {
    setForm(emptyForm);
    setEditingEvent(null);
    setShowForm(false);
  };

  const editEvent = (event: ConcertEvent) => {
    setEditingEvent(event);
    setForm({
      title: event.title,
      description: event.description ?? "",
      venue: event.venue,
      dateTime: event.dateTime.slice(0, 16),
    });
    setShowForm(true);
  };

  const saveEvent = async () => {
    const payload: EventRequest = { ...form, dateTime: form.dateTime };
    try {
      if (editingEvent) {
        await updateMutation.mutateAsync({ id: editingEvent.id, event: payload });
        toast.success("Event updated");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Event created");
      }
      resetForm();
    } catch {
      toast.error("Could not save event");
    }
  };

  const removeEvent = async (eventId: number) => {
    try {
      await deleteMutation.mutateAsync(eventId);
      toast.success("Event deleted");
    } catch {
      toast.error("Event could not be deleted while it has zones or bookings");
    }
  };

  const updateField = (field: keyof EventForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12 space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-5xl">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage events and zone availability</p>
          </div>
          <Button variant="default" onClick={() => { resetForm(); setShowForm(true); }} className="gap-2">
            <Glyph name="plus" /> Add Event
          </Button>
        </div>

        {showForm && (
          <section className="border-2 border-ink bg-paper p-6 print-shadow space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">{editingEvent ? "Edit Event" : "Add New Event"}</h2>
              <Button variant="ghost" size="icon" onClick={resetForm} aria-label="Close event form"><Glyph name="close" /></Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1"><Label htmlFor="event-title">Title</Label><Input id="event-title" required maxLength={150} value={form.title} onChange={(event) => updateField("title", event.target.value)} /></div>
              <div className="space-y-1"><Label htmlFor="event-venue">Venue</Label><Input id="event-venue" required maxLength={200} value={form.venue} onChange={(event) => updateField("venue", event.target.value)} /></div>
              <div className="space-y-1"><Label htmlFor="event-date">Date and time</Label><Input id="event-date" type="datetime-local" required value={form.dateTime} onChange={(event) => updateField("dateTime", event.target.value)} /></div>
              <div className="space-y-1 md:col-span-2"><Label htmlFor="event-description">Description</Label><Input id="event-description" maxLength={5000} value={form.description} onChange={(event) => updateField("description", event.target.value)} /></div>
            </div>
            <Button variant="default" disabled={saving || !form.title.trim() || !form.venue.trim() || !form.dateTime} onClick={() => void saveEvent()}>
              {saving ? "Saving..." : editingEvent ? "Update Event" : "Create Event"}
            </Button>
          </section>
        )}

        {isLoading ? <p className="py-12 text-center text-muted-foreground">Loading events...</p> : null}
        {isError ? <div className="py-12 text-center space-y-4"><p>Events could not be loaded.</p><Button onClick={() => void refetch()}>Retry</Button></div> : null}
        {!isLoading && !isError ? (
          <div className="border-2 border-ink bg-paper overflow-hidden print-shadow">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border/50">
                  {["Event", "Date", "Venue", "Zones", "Tickets", "Actions"].map((heading) => <th key={heading} className="text-left px-4 py-3 font-medium text-muted-foreground">{heading}</th>)}
                </tr></thead>
                <tbody>
                  {events.map((event) => {
                    const totalTickets = event.zones.reduce((total, zone) => total + zone.totalCapacity, 0);
                    const availableTickets = event.zones.reduce((total, zone) => total + zone.availableCapacity, 0);
                    return <tr key={event.id} className="border-b border-border/30">
                      <td className="px-4 py-3 font-medium">{event.title}</td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(event.dateTime).toLocaleString()}</td>
                      <td className="px-4 py-3 text-muted-foreground">{event.venue}</td>
                      <td className="px-4 py-3">{event.zones.length}</td>
                      <td className="px-4 py-3">{availableTickets}/{totalTickets}</td>
                      <td className="px-4 py-3"><div className="flex gap-1">
                        <Button variant="ghost" size="icon" aria-label={`Edit ${event.title}`} onClick={() => editEvent(event)}><Glyph name="edit" /></Button>
                        <Button variant="ghost" size="icon" aria-label={`Delete ${event.title}`} disabled={deleteMutation.isPending} onClick={() => void removeEvent(event.id)}><Glyph name="delete" /></Button>
                      </div></td>
                    </tr>;
                  })}
                  {events.length === 0 && <tr><td className="px-4 py-8 text-center text-muted-foreground" colSpan={6}>No events found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Admin;