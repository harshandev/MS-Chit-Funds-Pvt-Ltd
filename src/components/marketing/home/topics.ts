import { BookOpen, FileSearch, Gavel, Layers, Scale } from "lucide-react";

export const learnTopics = [
  { id: "how-chit-funds-work", icon: BookOpen, title: "How chit funds work", text: "A group contributes monthly; each month one member receives the chit amount." },
  { id: "auction-discounts", icon: Gavel, title: "Understanding auction discounts", text: "Why a winning bidder accepts less than the gross chit, and where the difference goes." },
  { id: "after-winning", icon: Scale, title: "What happens after winning", text: "What changes for a winning ticket and what stays the same." },
  { id: "future-instalments", icon: Layers, title: "Understanding future instalments", text: "Your continuing obligation after receiving the chit amount." },
  { id: "reading-agreement", icon: FileSearch, title: "Reading a chit agreement", text: "The clauses worth reading carefully before you sign anything." },
] as const;
