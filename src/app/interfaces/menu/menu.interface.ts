import { SafeHtml } from "@angular/platform-browser";

export interface IMenuItem {
    icon?: string | HTMLElement | SafeHtml;
    title: string;
    link: string;
    linkType: "internal" | "external";
    type: string[];
}