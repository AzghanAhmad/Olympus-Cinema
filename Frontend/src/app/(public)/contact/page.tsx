'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { getPublicSiteSettings, PublicSiteSettings } from '@/services/settingsService';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(3, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [site, setSite] = useState<PublicSiteSettings | null>(null);

  useEffect(() => {
    getPublicSiteSettings().then(setSite);
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    await new Promise((r) => setTimeout(r, 600));
    setSubmitted(true);
    reset();
  };

  const cinemaName = site?.cinemaName || 'Crystal Entertainment';
  const contactEmail = site?.contactEmail || 'hello@crystalentertainment.com';
  const contactPhone = site?.contactPhone || '+1 (800) 555-OLYM';
  const address = site?.address || cinemaName;

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Contact Cinema Concierge</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Have a question about bookings or cinema reservations? Get in touch.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="p-8 bg-card border border-border rounded-3xl space-y-6 shadow-sm">
            <h2 className="text-xl font-extrabold">Send Us a Message</h2>

            {submitted ? (
              <div className="p-6 bg-primary/10 border border-primary/30 rounded-2xl text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-primary mx-auto" />
                <h3 className="text-lg font-bold text-primary">Message Sent Successfully</h3>
                <p className="text-xs text-muted-foreground">
                  Thank you for reaching out! Our cinema concierge team will respond within 24 hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl mt-2"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Full Name</label>
                  <input
                    {...register('name')}
                    type="text"
                    placeholder="John Doe"
                    className="w-full py-2.5 px-3 bg-secondary text-foreground text-sm rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {errors.name && <p className="text-xs text-primary mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Email Address</label>
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="john@example.com"
                    className="w-full py-2.5 px-3 bg-secondary text-foreground text-sm rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {errors.email && <p className="text-xs text-primary mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Subject</label>
                  <input
                    {...register('subject')}
                    type="text"
                    placeholder="VIP Hall Reservation"
                    className="w-full py-2.5 px-3 bg-secondary text-foreground text-sm rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {errors.subject && <p className="text-xs text-primary mt-1">{errors.subject.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Message</label>
                  <textarea
                    {...register('message')}
                    rows={4}
                    placeholder="How can we assist you?"
                    className="w-full py-2.5 px-3 bg-secondary text-foreground text-sm rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                  {errors.message && <p className="text-xs text-primary mt-1">{errors.message.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/30"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>

          <div className="space-y-6">
            <div className="p-8 bg-card border border-border rounded-3xl space-y-6">
              <h2 className="text-xl font-extrabold">Cinema Headquarters</h2>
              <div className="space-y-4 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground block">{cinemaName}</strong>
                    <span>{address}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <strong className="text-foreground block">Phone</strong>
                    <span>{contactPhone}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <strong className="text-foreground block">Support Email</strong>
                    <span>{contactEmail}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative aspect-video rounded-3xl overflow-hidden border border-border bg-zinc-900 flex items-center justify-center text-center p-6">
              <div className="space-y-2">
                <MapPin className="w-10 h-10 text-primary mx-auto animate-bounce" />
                <h4 className="font-extrabold text-white text-base">{cinemaName}</h4>
                <p className="text-xs text-zinc-400">Details synced from admin settings</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
