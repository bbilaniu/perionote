"use client";

import type {
  AnchorHTMLAttributes,
  MouseEvent,
  ReactNode,
} from "react";

type FullPageLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href"
> & {
  href: string;
  children: ReactNode;
};

/**
 * Uses a document navigation so browser unload protection also applies when
 * entering or leaving an in-memory clinical form through browser history.
 */
export function FullPageLink({
  href,
  children,
  onClick,
  ...props
}: FullPageLinkProps) {
  function navigateWithDocumentReload(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);

    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      props.target === "_blank"
    ) {
      return;
    }

    event.preventDefault();
    window.location.assign(href);
  }

  return (
    <a href={href} onClick={navigateWithDocumentReload} {...props}>
      {children}
    </a>
  );
}
