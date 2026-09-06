import { TESTIMONIALS } from "../marketing.constants";

export function TestimonialsSection() {
  return (
    <section
      aria-label="What people say"
      className="mx-auto max-w-[1240px] px-5 py-20 md:px-10 lg:py-24"
    >
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {TESTIMONIALS.map((testimonial) => (
          <li key={testimonial.name}>
            <figure className="flex h-full flex-col justify-between gap-5.5 rounded-[30px] bg-surface-raised p-7.5 shadow-[0_20px_40px_-30px_rgba(30,18,51,0.4)]">
              <blockquote className="text-[16.5px] leading-[1.5] tracking-[-0.015em] text-pretty text-ink">
                {testimonial.text}
              </blockquote>
              <figcaption className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className={`size-9.5 rounded-full ${testimonial.avatarClassName}`}
                />
                <span className="block">
                  <span className="block text-sm font-bold text-ink">
                    {testimonial.name}
                  </span>
                  <span className="block text-[12.5px] font-medium text-text-tertiary">
                    {testimonial.role}
                  </span>
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}
