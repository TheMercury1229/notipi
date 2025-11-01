import { useState, useEffect } from "react";
import { Navbar } from "@/components/dashboard/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Copy, Plus, Trash2, Eye, EyeOff, Loader2, ShieldOff, ShieldCheck, RotateCcw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { apiKeyService } from "@/lib/api.service";

interface ApiKey {
  _id: string;
  name: string;
  key?: string;
  hashedKey?: string;
  createdAt: string;
  isRevoked: boolean;
}

export default function ApiKeysPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isKeyGenerated, setIsKeyGenerated] = useState(false);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [generatedKey, setGeneratedKey] = useState("");
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  
  // Revoke confirmation dialog state
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [keyToRevoke, setKeyToRevoke] = useState<ApiKey | null>(null);
  const [revokeLoading, setRevokeLoading] = useState(false);

  // Restore confirmation dialog state
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [keyToRestore, setKeyToRestore] = useState<ApiKey | null>(null);
  const [restoreLoading, setRestoreLoading] = useState(false);

  // Fetch API keys on component mount
  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      setFetchLoading(true);
      const response = await apiKeyService.getAllApiKeys();
      if (response.success) {
        setApiKeys(response.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch API keys");
    } finally {
      setFetchLoading(false);
    }
  };

  const handleGenerateKey = async () => {
    if (!newKeyName.trim()) {
      toast.error("Please enter a key name");
      return;
    }

    try {
      setLoading(true);
      const response = await apiKeyService.createApiKey(newKeyName);

      if (response.success) {
        // The raw key is only returned once during creation
        setGeneratedKey(response.data.key);
        setIsKeyGenerated(true);
        toast.success("API Key generated successfully!");

        // Refresh the list
        await fetchApiKeys();
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to generate API key"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("API Key copied to clipboard!");
  };

  const handleRevokeClick = (apiKey: ApiKey) => {
    setKeyToRevoke(apiKey);
    setRevokeDialogOpen(true);
  };

  const handleRevokeConfirm = async () => {
    if (!keyToRevoke) return;

    try {
      setRevokeLoading(true);
      const response = await apiKeyService.revokeApiKey(keyToRevoke._id);
      
      if (response.success) {
        toast.success("API Key revoked successfully!");
        await fetchApiKeys();
        setRevokeDialogOpen(false);
        setKeyToRevoke(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to revoke API key");
    } finally {
      setRevokeLoading(false);
    }
  };

  const handleRestoreClick = (apiKey: ApiKey) => {
    setKeyToRestore(apiKey);
    setRestoreDialogOpen(true);
  };

  const handleRestoreConfirm = async () => {
    if (!keyToRestore) return;

    try {
      setRestoreLoading(true);
      const response = await apiKeyService.restoreApiKey(keyToRestore._id);
      
      if (response.success) {
        toast.success("API Key restored successfully!");
        await fetchApiKeys();
        setRestoreDialogOpen(false);
        setKeyToRestore(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to restore API key");
    } finally {
      setRestoreLoading(false);
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (!confirm("Are you sure you want to delete this API key? This action cannot be undone.")) return;

    try {
      const response = await apiKeyService.deleteApiKey(id);
      if (response.success) {
        toast.success("API Key deleted successfully!");
        await fetchApiKeys();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete API key");
    }
  };

  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(keyId)) {
        newSet.delete(keyId);
      } else {
        newSet.add(keyId);
      }
      return newSet;
    });
  };

  const maskKey = (key: string) => {
    if (!key) return "••••••••••••";
    const prefix = key.substring(0, 12);
    const suffix = key.substring(key.length - 4);
    return `${prefix}••••••••${suffix}`;
  };

  const handleDialogClose = (open: boolean) => {
    setIsCreateOpen(open);
    if (!open) {
      setIsKeyGenerated(false);
      setNewKeyName("");
      setGeneratedKey("");
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <Navbar title="API Keys" />

      <main className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Manage Your API Keys</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Create and manage API keys for your applications
            </p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Generate API Key
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your API Keys</CardTitle>
          </CardHeader>
          <CardContent>
            {fetchLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : apiKeys.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No API keys found. Generate your first API key to get started.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>API Key</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((apiKey) => (
                    <TableRow key={apiKey._id} className={apiKey.isRevoked ? "opacity-60" : ""}>
                      <TableCell className="font-medium">
                        {apiKey.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono">
                            {visibleKeys.has(apiKey._id) && apiKey.key
                              ? apiKey.key
                              : maskKey(apiKey.key || apiKey.hashedKey || "")}
                          </code>
                          {apiKey.key && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => toggleKeyVisibility(apiKey._id)}
                              disabled={apiKey.isRevoked}
                            >
                              {visibleKeys.has(apiKey._id) ? (
                                <EyeOff className="w-3 h-3" />
                              ) : (
                                <Eye className="w-3 h-3" />
                              )}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={apiKey.isRevoked ? "destructive" : "default"}
                          className="gap-1"
                        >
                          {apiKey.isRevoked ? (
                            <>
                              <ShieldOff className="w-3 h-3" />
                              Revoked
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="w-3 h-3" />
                              Active
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(apiKey.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {apiKey.key && !apiKey.isRevoked && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCopyKey(apiKey.key!)}
                              title="Copy API Key"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          )}
                          {!apiKey.isRevoked ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRevokeClick(apiKey)}
                              title="Revoke API Key"
                            >
                              <ShieldOff className="w-4 h-4 text-orange-500" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRestoreClick(apiKey)}
                              title="Restore API Key"
                            >
                              <RotateCcw className="w-4 h-4 text-green-500" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteKey(apiKey._id)}
                            title="Delete API Key"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Generate API Key Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate New API Key</DialogTitle>
            <DialogDescription>
              Create a new API key for your application
            </DialogDescription>
          </DialogHeader>

          {!isKeyGenerated ? (
            <>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="keyName">Key Name</Label>
                  <Input
                    id="keyName"
                    placeholder="Production Key"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    A descriptive name to identify this key
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleGenerateKey}
                  disabled={!newKeyName || loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Key"
                  )}
                </Button>
              </div>
            </>
          ) : (
            <>
              <Alert>
                <AlertDescription className="space-y-3">
                  <p className="font-medium">
                    Your API Key has been generated!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Make sure to copy your API key now. You won't be able to
                    see it again!
                  </p>
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <code className="text-sm font-mono flex-1 break-all">
                      {generatedKey}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopyKey(generatedKey)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
              <div className="flex justify-end">
                <Button onClick={() => handleDialogClose(false)}>Done</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Revoke Confirmation Dialog */}
      <AlertDialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke API Key</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Are you sure you want to revoke this API key?</p>
              <p className="font-medium text-foreground">
                Key: {keyToRevoke?.name}
              </p>
              <p className="text-sm">
                This will immediately invalidate the key. Any applications using
                this key will stop working. You can restore it later if needed.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={revokeLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevokeConfirm}
              disabled={revokeLoading}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {revokeLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Revoking...
                </>
              ) : (
                "Revoke Key"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restore Confirmation Dialog */}
      <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore API Key</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Are you sure you want to restore this API key?</p>
              <p className="font-medium text-foreground">
                Key: {keyToRestore?.name}
              </p>
              <p className="text-sm">
                This will reactivate the key and make it usable again. Applications
                using this key will be able to make API calls.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={restoreLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRestoreConfirm}
              disabled={restoreLoading}
              className="bg-green-500 hover:bg-green-600"
            >
              {restoreLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Restoring...
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Restore Key
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}