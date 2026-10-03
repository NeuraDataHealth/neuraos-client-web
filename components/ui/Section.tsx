import { clsx } from "clsx";
import { Container, type ContainerProps } from "@/components/ui/Container";

type SectionProps = Omit<ContainerProps, "as" | "id"> & {
  /** Anchor target used by the nav (e.g. "cores"). */
  id: string;
  /** Id of the heading that names this section. */
  labelledBy: string;
};

/** A page section: an anchorable <section> named by its heading, with page gutters. */
export function Section({ id, labelledBy, className, ...rest }: SectionProps) {
  return (
    <Container
      as="section"
      id={id}
      aria-labelledby={labelledBy}
      className={clsx("relative", className)}
      {...rest}
    />
  );
}
