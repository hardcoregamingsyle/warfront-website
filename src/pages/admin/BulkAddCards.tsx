import { useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Upload, FileSpreadsheet, Image as ImageIcon, AlertCircle } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

// Simple CSV Parser to avoid dependencies
const parseCSV = (text: string) => {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentField += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentField);
        currentField = '';
      } else if (char === '\n' || (char === '\r' && nextChar === '\n')) {
        currentRow.push(currentField);
        rows.push(currentRow);
        currentRow = [];
        currentField = '';
        if (char === '\r') i++;
      } else if (char === '\r') {
         currentRow.push(currentField);
         rows.push(currentRow);
         currentRow = [];
         currentField = '';
      } else {
        currentField += char;
      }
    }
  }
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }
  
  // Convert to objects
  if (rows.length === 0) return [];
  
  const headers = rows[0].map(h => h.trim());
  const data = rows.slice(1).map(row => {
    const obj: any = {};
    headers.forEach((header, index) => {
      // Handle case where row might be shorter than headers
      if (index < row.length) {
        obj[header] = row[index]?.trim();
      }
    });
    return obj;
  }).filter(row => Object.keys(row).length > 0 && Object.values(row).some(v => v));
  
  return data;
};

export default function BulkAddCards() {
  const { user, token } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  // Mutations
  const bulkUpsert = useMutation(api.cards.bulkUpsertCards);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const linkImage = useMutation(api.cards.linkImageByCustomId);

  const roleLc = (user?.role ?? "").toString().toLowerCase();
  const emailLc = (user?.email_normalized ?? "").toLowerCase();
  const isAuthorized =
    !!user &&
    (roleLc === "admin" || roleLc === "owner" || emailLc === "hardcorgamingstyle@gmail.com");

  const handleCsvUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !token) return;

    setIsUploading(true);
    setLogs([]);
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const data = parseCSV(text);
          
        // Validate and transform data
        const validCards = data.map((row: any) => ({
          customId: row.customId || row.id || row.ID, // Try to find ID column
          cardName: row.cardName || row.name || row.Name || "Untitled",
          cardType: row.cardType || row.type || "Standard",
          rarity: row.rarity,
          frame: row.frame,
          batch: row.batch,
          numberingA: row.numberingA && !isNaN(parseInt(row.numberingA)) ? parseInt(row.numberingA) : undefined,
          numberingB: row.numberingB && !isNaN(parseInt(row.numberingB)) ? parseInt(row.numberingB) : undefined,
          signed: row.signed,
        })).filter((c: any) => c.customId); // Must have an ID

        if (validCards.length === 0) {
          toast.error("No valid cards found in CSV. Ensure there is a 'customId' or 'id' column.");
          setIsUploading(false);
          return;
        }

        setLogs(prev => [...prev, `Found ${validCards.length} cards to process...`]);

        // Process in chunks to avoid hitting limits
        const chunkSize = 50;
        for (let i = 0; i < validCards.length; i += chunkSize) {
          const chunk = validCards.slice(i, i + chunkSize);
          await bulkUpsert({ token, cards: chunk });
          const percent = Math.min(100, Math.round(((i + chunk.length) / validCards.length) * 100));
          setProgress(percent);
          setLogs(prev => [...prev, `Processed ${i + chunk.length}/${validCards.length} cards`]);
        }

        toast.success(`Successfully processed ${validCards.length} cards!`);
        setLogs(prev => [...prev, "CSV Import Complete!"]);
      } catch (error: any) {
        console.error(error);
        toast.error("Failed to import CSV: " + error.message);
        setLogs(prev => [...prev, `Error: ${error.message}`]);
      } finally {
        setIsUploading(false);
      }
    };
    
    reader.onerror = () => {
      toast.error("Failed to read file");
      setIsUploading(false);
    };

    reader.readAsText(file);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !token) return;

    setIsUploading(true);
    setProgress(0);
    setLogs([]);
    
    const totalFiles = files.length;
    let successCount = 0;
    let failCount = 0;

    setLogs(prev => [...prev, `Starting upload for ${totalFiles} images...`]);

    for (let i = 0; i < totalFiles; i++) {
      const file = files[i];
      // Assume filename is the customId (e.g., "card-001.png" -> "card-001")
      // Remove extension
      const customId = file.name.replace(/\.[^/.]+$/, "");

      try {
        // 1. Get Upload URL
        const postUrl = await generateUploadUrl();
        
        // 2. Upload File
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!result.ok) throw new Error(`Upload failed for ${file.name}`);
        
        const { storageId } = await result.json();

        // 3. Link to Card
        await linkImage({ token, customId, storageId: storageId as Id<"_storage"> });
        
        successCount++;
        setLogs(prev => [...prev, `✅ Linked ${file.name} to ${customId}`]);
      } catch (error: any) {
        console.error(error);
        failCount++;
        setLogs(prev => [...prev, `❌ Failed ${file.name}: ${error.message}`]);
      }

      const percent = Math.round(((i + 1) / totalFiles) * 100);
      setProgress(percent);
    }

    setIsUploading(false);
    toast.success(`Finished! Success: ${successCount}, Failed: ${failCount}`);
    setLogs(prev => [...prev, `Upload Complete. Success: ${successCount}, Failed: ${failCount}`]);
  };

  if (!isAuthorized) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full py-24">
          <Card className="bg-slate-900/50 border-red-500/20">
            <CardHeader>
              <CardTitle className="text-red-400">Access Denied</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">You are not authorized to view this page.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Helmet>
        <title>Bulk Add Cards | Warfront Admin</title>
      </Helmet>

      <div className="container mx-auto py-8 max-w-4xl">
        <h1 className="text-4xl font-bold text-red-400 mb-6">Bulk Import Tools</h1>

        <Tabs defaultValue="csv" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-900/50 border border-slate-800">
            <TabsTrigger value="csv" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              CSV Data Import
            </TabsTrigger>
            <TabsTrigger value="images" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
              <ImageIcon className="mr-2 h-4 w-4" />
              Bulk Image Upload
            </TabsTrigger>
          </TabsList>

          <TabsContent value="csv" className="mt-6">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-xl text-slate-200">Import Cards via CSV</CardTitle>
                <CardDescription>
                  Upload a CSV file containing card data. The file must have a <code>customId</code> column.
                  Other supported columns: <code>cardName</code>, <code>cardType</code>, <code>rarity</code>, <code>frame</code>, <code>batch</code>, <code>numberingA</code>, <code>numberingB</code>.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-lg p-12 hover:bg-slate-800/50 transition-colors">
                  <Upload className="h-12 w-12 text-slate-500 mb-4" />
                  <label htmlFor="csv-upload" className="cursor-pointer">
                    <span className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition-colors">
                      Select CSV File
                    </span>
                    <input
                      id="csv-upload"
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={handleCsvUpload}
                      disabled={isUploading}
                    />
                  </label>
                  <p className="text-slate-500 mt-2 text-sm">or drag and drop here</p>
                </div>

                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-slate-400">
                      <span>Processing...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2 bg-slate-800" />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="images" className="mt-6">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-xl text-slate-200">Bulk Image Upload</CardTitle>
                <CardDescription>
                  Upload multiple images at once. The system will automatically link images to cards where the 
                  <strong> filename matches the Card ID</strong> (e.g., <code>card-001.png</code> links to card with ID <code>card-001</code>).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert className="bg-yellow-900/20 border-yellow-600/50 text-yellow-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Naming Convention</AlertTitle>
                  <AlertDescription>
                    Ensure your image filenames exactly match the Card IDs (excluding extension). 
                    Cards must exist in the database before uploading images.
                  </AlertDescription>
                </Alert>

                <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-lg p-12 hover:bg-slate-800/50 transition-colors">
                  <ImageIcon className="h-12 w-12 text-slate-500 mb-4" />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <span className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition-colors">
                      Select Images
                    </span>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                  </label>
                  <p className="text-slate-500 mt-2 text-sm">Select multiple files to upload</p>
                </div>

                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-slate-400">
                      <span>Uploading & Linking...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2 bg-slate-800" />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {logs.length > 0 && (
          <Card className="mt-6 bg-black/40 border-slate-800">
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-mono text-slate-400">Process Logs</CardTitle>
            </CardHeader>
            <CardContent className="max-h-60 overflow-y-auto font-mono text-xs space-y-1 text-slate-500">
              {logs.map((log, i) => (
                <div key={i} className={log.includes("❌") ? "text-red-400" : log.includes("✅") ? "text-green-400" : ""}>
                  {log}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}