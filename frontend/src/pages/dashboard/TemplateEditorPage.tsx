import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Sparkles } from "lucide-react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export default function TemplateEditorPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [templateName, setTemplateName] = useState("Welcome Email");
  const [subject, setSubject] = useState("Welcome to NotiPi!");
  const [htmlContent, setHtmlContent] = useState(`<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #000; color: #fff; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .button { background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to NotiPi!</h1>
    </div>
    <div class="content">
      <p>Hi {{name}},</p>
      <p>Thank you for joining NotiPi. We're excited to help you send amazing notifications!</p>
      <p><a href="{{verify_link}}" class="button">Verify Email</a></p>
      <p>Best regards,<br>The NotiPi Team</p>
    </div>
  </div>
</body>
</html>`);

  const handleSave = () => {
    // TODO: Save template to backend
    console.log("Saving template:", { id, templateName, subject, htmlContent });
    navigate("/dashboard/templates");
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-background sticky top-0 z-10">
        <div className="flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard/templates")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">
                {id === "new" ? "Create Template" : "Edit Template"}
              </h1>
              <p className="text-sm text-muted-foreground">{templateName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Generate with AI
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </header>

      {/* Resizable Editor and Preview */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Editor Panel */}
        <ResizablePanel defaultSize={50} minSize={30}>
          <div className="h-full flex flex-col p-6 overflow-auto">
            <div className="space-y-6 max-w-3xl">
              <div className="space-y-2">
                <Label htmlFor="templateName">Template Name</Label>
                <Input
                  id="templateName"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Welcome Email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Email Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Welcome to our platform!"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="htmlContent">HTML Content</Label>
                <Textarea
                  id="htmlContent"
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  className="font-mono text-sm min-h-[500px]"
                  placeholder="Enter your HTML template..."
                />
                <p className="text-xs text-muted-foreground">
                  Use variables like {`{{name}}`}, {`{{email}}`},{" "}
                  {`{{verify_link}}`} for dynamic content
                </p>
              </div>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Preview Panel */}
        <ResizablePanel defaultSize={50} minSize={30}>
          <div className="h-full flex flex-col">
            <div className="border-b p-4 bg-muted/30">
              <h2 className="text-sm font-semibold">Live Preview</h2>
              <p className="text-xs text-muted-foreground">
                See how your email will look to recipients
              </p>
            </div>
            <div className="flex-1 p-6 overflow-auto bg-muted/10">
              <div className="max-w-2xl mx-auto bg-background rounded-lg shadow-lg">
                <div className="border-b p-4">
                  <div className="text-xs text-muted-foreground mb-1">
                    Subject:
                  </div>
                  <div className="font-medium">{subject}</div>
                </div>
                <div className="p-6">
                  <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
                </div>
              </div>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
