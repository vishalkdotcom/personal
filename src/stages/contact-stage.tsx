import { A } from "@solidjs/router";
import { createSignal, Show, type Component } from "solid-js";
import { CONTACT_EMAIL } from "../contact/content";
import { validateContactPayload, type ContactFieldErrors } from "../contact/schema";
import { StageTitle } from "../shell/stage-title";

type SubmitState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

const fieldClass =
  "mt-1.5 w-full rounded-md border bg-bg-deep px-2.5 py-2 text-[13px] text-fg outline-none placeholder:text-faint focus:border-accent";

const labelClass = "m-0 text-[12px] font-medium text-muted";

function inputClass(hasError: boolean): string {
  return `${fieldClass} ${hasError ? "border-red-500" : "border-border"}`;
}

/**
 * Contact Mode center: full name / email / message form.
 * Client validates before POST /api/contact; delivery errors stay safe.
 */
export const ContactStage: Component = () => {
  const [name, setName] = createSignal("");
  const [email, setEmail] = createSignal("");
  const [message, setMessage] = createSignal("");
  const [issues, setIssues] = createSignal<ContactFieldErrors>({});
  const [submit, setSubmit] = createSignal<SubmitState>({ kind: "idle" });

  async function onSubmit(event: SubmitEvent & { currentTarget: HTMLFormElement }) {
    event.preventDefault();
    setSubmit({ kind: "idle" });

    const validated = validateContactPayload({
      name: name(),
      email: email(),
      message: message(),
    });

    if (!validated.ok) {
      setIssues(validated.issues);
      return;
    }

    setIssues({});
    setSubmit({ kind: "submitting" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated.data),
      });
      const payload = (await response.json().catch(() => null)) as {
        success?: boolean;
        error?: boolean;
        message?: string;
        issues?: ContactFieldErrors;
      } | null;

      if (!response.ok || payload?.error) {
        if (payload?.issues) setIssues(payload.issues);
        setSubmit({
          kind: "error",
          message:
            payload?.message ?? "Failed to send email. Please try again or contact me directly.",
        });
        return;
      }

      setName("");
      setEmail("");
      setMessage("");
      setSubmit({
        kind: "success",
        message: payload?.message ?? "Message sent successfully!",
      });
    } catch {
      setSubmit({
        kind: "error",
        message: "Failed to send email. Please try again or contact me directly.",
      });
    }
  }

  return (
    <article aria-label="Contact">
      <p class="mb-2 mt-0 text-[11px] tracking-[0.12em] text-faint uppercase">Contact</p>
      <StageTitle>Get in touch</StageTitle>
      <p class="m-0 mb-5 max-w-[48ch] text-[13px] leading-[1.45] text-muted">
        Drop me a note. Email and LinkedIn are also in the side panel.
      </p>

      <form class="flex max-w-[36rem] flex-col gap-3.5" onSubmit={onSubmit} novalidate>
        <div>
          <label for="contact-name" class={labelClass}>
            Name
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            autocomplete="name"
            placeholder="Your name"
            class={inputClass(Boolean(issues().name))}
            value={name()}
            onInput={(event) => setName(event.currentTarget.value)}
          />
          <Show when={issues().name}>
            {(issue) => (
              <p class="m-0 mt-1 text-[12px] text-red-600" role="alert">
                {issue()}
              </p>
            )}
          </Show>
        </div>

        <div>
          <label for="contact-email" class={labelClass}>
            Email
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autocomplete="email"
            placeholder="you@example.com"
            class={inputClass(Boolean(issues().email))}
            value={email()}
            onInput={(event) => setEmail(event.currentTarget.value)}
          />
          <Show when={issues().email}>
            {(issue) => (
              <p class="m-0 mt-1 text-[12px] text-red-600" role="alert">
                {issue()}
              </p>
            )}
          </Show>
        </div>

        <div>
          <label for="contact-message" class={labelClass}>
            Message
          </label>
          <textarea
            id="contact-message"
            name="message"
            rows={6}
            placeholder="Your message"
            class={`${inputClass(Boolean(issues().message))} min-h-[8rem] resize-y`}
            value={message()}
            onInput={(event) => setMessage(event.currentTarget.value)}
          />
          <Show when={issues().message}>
            {(issue) => (
              <p class="m-0 mt-1 text-[12px] text-red-600" role="alert">
                {issue()}
              </p>
            )}
          </Show>
        </div>

        <button
          type="submit"
          class="inline-flex w-fit items-center justify-center rounded-md border border-border bg-bg-panel px-3 py-2 text-[13px] font-medium text-fg hover:bg-bg-hover disabled:opacity-60"
          disabled={submit().kind === "submitting"}
        >
          {submit().kind === "submitting" ? "Sending…" : "Send message"}
        </button>

        <Show when={submit().kind === "success"}>
          <p class="m-0 text-[13px] text-accent" role="status">
            {(submit() as { kind: "success"; message: string }).message}
          </p>
        </Show>
        <Show when={submit().kind === "error"}>
          <p class="m-0 text-[13px] text-red-600" role="alert">
            {(submit() as { kind: "error"; message: string }).message}{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              class="text-accent underline-offset-2 hover:underline"
            >
              Email me directly
            </a>
          </p>
        </Show>
      </form>
      <p class="m-0 mt-4 max-w-[36rem] text-[12px] text-faint">
        Messages go to the site owner only.{" "}
        <A href="/privacy" class="text-accent underline-offset-2 hover:underline">
          Privacy
        </A>
      </p>
    </article>
  );
};
