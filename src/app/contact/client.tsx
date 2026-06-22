"use client";

import { useState } from "react";
import { Mail, MessageSquare, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface ContactPageClientProps {
  formspreeId: string;
  contactEmail: string;
}

export function ContactPageClient({
  formspreeId,
  contactEmail,
}: ContactPageClientProps): React.ReactElement {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const hasFormspree = formspreeId.length > 0;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!hasFormspree) return;

    setSubmitting(true);
    try {
      const res = await fetch(`https://formspree.io/f/${formspreeId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (res.ok) {
        setSubmitted(true);
        toast.success("Message sent! We'll get back to you soon.");
      } else {
        toast.error("Something went wrong. Please try the email link below.");
      }
    } catch {
      toast.error("Could not send message. Please use the email link below.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="h-7 w-7 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Message sent!</h1>
        <p className="text-muted-foreground">
          Thanks for reaching out. We read every message and will get back to you as soon as
          possible.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 space-y-8">
      <div className="space-y-3">
        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
          <MessageSquare className="h-5 w-5 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Contact us</h1>
        <p className="text-muted-foreground">
          Found a bug? Have a feature request? Just want to say hello? We&apos;re happy to hear from
          you.
        </p>
      </div>

      {hasFormspree ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-sm font-medium">
              Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground/60"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground/60"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="message" className="text-sm font-medium">
              Message
            </label>
            <textarea
              id="message"
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what's on your mind..."
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground/60 resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-white text-sm font-semibold pdf-badge rounded-xl hover:opacity-90 disabled:opacity-60 transition-opacity"
          >
            {submitting ? (
              "Sending..."
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send message
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="rounded-xl border border-border bg-muted/20 p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Email us directly and we&apos;ll get back to you as soon as possible.
          </p>
          <a
            href={`mailto:${contactEmail}?subject=pdfNest%20Feedback`}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-semibold pdf-badge rounded-xl hover:opacity-90 transition-opacity"
          >
            <Mail className="h-4 w-4" />
            Email us
          </a>
          <p className="text-xs text-muted-foreground">{contactEmail}</p>
        </div>
      )}

      <div className="border-t border-border pt-6 space-y-2">
        <p className="text-sm font-medium">Other ways to reach us</p>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>
            Report a bug or request a feature on{" "}
            <a
              href="https://github.com/mahendra2811/pdfNest/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              GitHub Issues
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
