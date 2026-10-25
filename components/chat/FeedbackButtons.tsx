import { clsx } from "clsx";
import { Icon } from "@/components/ui/Icon";
import type { FeedbackRating } from "@/lib/types";

type FeedbackButtonsProps = {
  rating: FeedbackRating | null;
  onRate: (rating: FeedbackRating) => void;
};

const options: { rating: FeedbackRating; label: string; icon: "thumb-up" | "thumb-down" }[] = [
  { rating: "up", label: "Helpful", icon: "thumb-up" },
  { rating: "down", label: "Not helpful", icon: "thumb-down" },
];

/** Thumbs up / down on an AI answer; the chosen one stays tinted. */
export function FeedbackButtons({ rating, onRate }: FeedbackButtonsProps) {
  return (
    <span className="flex items-center gap-0.5">
      {options.map((option) => {
        const on = rating === option.rating;
        return (
          <button
            key={option.rating}
            type="button"
            aria-label={option.label}
            title={option.label}
            aria-pressed={on}
            onClick={() => onRate(option.rating)}
            className={clsx(
              "flex size-7 cursor-pointer items-center justify-center rounded-full transition-colors duration-(--duration-row)",
              on ? "bg-accent/8 text-accent" : "text-muted hover:bg-ink/4 hover:text-ink",
            )}
          >
            <Icon name={option.icon} size={14} />
          </button>
        );
      })}
    </span>
  );
}
