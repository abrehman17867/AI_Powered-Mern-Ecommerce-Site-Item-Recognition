import React from "react";
import PageLayout from "../../../components/layout/PageLayout";
import Card from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";

const ContactUs = () => {
  return (
    <PageLayout
      eyebrow="Support"
      title="Get in touch"
      description="Questions about orders, products, or your account — we're here to help."
    >
      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-4" padding>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Contact</p>
          <h2 className="mt-2 text-2xl font-bold text-foreground">We&apos;d love to hear from you</h2>
          <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
            Reach out for order help, product questions, or feedback about the store.
          </p>
          <ul className="mt-8 space-y-4 text-sm text-foreground-muted">
            <li>
              <span className="font-medium text-foreground">Address</span>
              <br />
              Johar Town, Kyaban-e-Jinnah Road, Lahore, Pakistan
            </li>
            <li>
              <span className="font-medium text-foreground">Email</span>
              <br />
              info@ecommerce.com
            </li>
          </ul>
        </Card>
        <Card className="lg:col-span-8" title="Send a message" subtitle="We typically respond within one business day.">
          <form className="grid gap-5 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
            <Input label="Full name" name="name" placeholder="Your name" className="sm:col-span-2" />
            <Input label="Email" name="email" type="email" placeholder="you@example.com" />
            <Input label="Phone" name="phone" type="tel" placeholder="+92 …" />
            <div className="sm:col-span-2">
              <label htmlFor="message" className="text-sm font-medium text-foreground">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                placeholder="How can we help?"
                className="ui-input mt-1.5 min-h-[8rem] resize-y py-3"
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit">Send message</Button>
            </div>
          </form>
        </Card>
      </div>
    </PageLayout>
  );
};

export default ContactUs;
