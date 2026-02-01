import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { cn } from "../../../lib/utils/utils";

interface Document {
  id: string;
  title: string;
  type: "student" | "teacher" | "financial" | "course" | "syllabus" | "other";
  time: string;
}

interface Props {
  documents: Document[];
}

export const RecentDocuments = ({ documents }: Props) => {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Recent Documents
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {documents.map((doc) => {
            const style = typeStyles[doc.type];
            const Icon = style.icon;

            return (
              <div
                key={doc.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted"
              >
                <div className={cn("p-2 rounded-lg", style.bg)}>
                  <Icon className={cn("h-4 w-4", style.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{doc.title}</p>
                  <p className="text-xs text-muted-foreground">{doc.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
