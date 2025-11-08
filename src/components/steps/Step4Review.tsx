// src/components/steps/Step4Review.tsx

import { useState } from "react";
import { ArrowRight, RotateCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { documentService } from "@/services/documentService";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PairedIDCard, CleanedDocument } from "@/types";

interface Step4ReviewProps {
  pairedIDs: PairedIDCard[];
  singleDocuments: CleanedDocument[];
  onContinue: () => void;
}

const Step4Review = ({ 
  pairedIDs, 
  singleDocuments, 
  onContinue 
}: Step4ReviewProps) => {
  const { toast } = useToast();
  const [localPairedIDs, setLocalPairedIDs] = useState(pairedIDs);
  const [localSingleDocs, setLocalSingleDocs] = useState(singleDocuments);

  const rotateDocument = (docId: string, isPaired: boolean, isFront?: boolean) => {
    if (isPaired && isFront !== undefined) {
      setLocalPairedIDs(prev => prev.map(pair => {
        if (isFront && pair.frontDoc.id === docId) {
          return {
            ...pair,
            frontDoc: {
              ...pair.frontDoc,
              rotation: ((pair.frontDoc.rotation + 90) % 360) as 0 | 90 | 180 | 270
            }
          };
        }
        if (!isFront && pair.backDoc.id === docId) {
          return {
            ...pair,
            backDoc: {
              ...pair.backDoc,
              rotation: ((pair.backDoc.rotation + 90) % 360) as 0 | 90 | 180 | 270
            }
          };
        }
        return pair;
      }));
    } else {
      setLocalSingleDocs(prev => prev.map(doc => 
        doc.id === docId
          ? { ...doc, rotation: ((doc.rotation + 90) % 360) as 0 | 90 | 180 | 270 }
          : doc
      ));
    }

    toast({
      title: "Rotated",
      description: "Document rotated 90°",
    });
  };

  return (
    <div className="h-[calc(100vh-180px)] flex flex-col p-4">
      {/* Summary */}
      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Review Documents</h3>
            <p className="text-sm text-muted-foreground">
              {localPairedIDs.length} paired IDs + {localSingleDocs.length} single docs = {localPairedIDs.length + localSingleDocs.length} total
            </p>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {localPairedIDs.length + localSingleDocs.length} ready
          </Badge>
        </div>
      </Card>

      {/* Content */}
      <div className="flex-1 overflow-auto space-y-6">
        {/* Paired ID Cards */}
        {localPairedIDs.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Paired ID Cards ({localPairedIDs.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {localPairedIDs.map(pair => (
                <Card key={pair.id} className="p-4">
                  <div className="mb-3">
                    <Badge variant="secondary">
                      {documentService.formatDocumentType(pair.frontDoc.detectedType).replace(' (Front)', '')}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Front */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Front</p>
                      <div 
                        className="relative aspect-[3/2] rounded border overflow-hidden bg-muted"
                        style={{
                          transform: `rotate(${pair.frontDoc.rotation}deg)`
                        }}
                      >
                        <img
                          src={pair.frontDoc.cleanedImage}
                          alt="Front"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-muted-foreground">
                          Q: {pair.frontDoc.qualityScore}%
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => rotateDocument(pair.frontDoc.id, true, true)}
                        >
                          <RotateCw className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Back */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Back</p>
                      <div 
                        className="relative aspect-[3/2] rounded border overflow-hidden bg-muted"
                        style={{
                          transform: `rotate(${pair.backDoc.rotation}deg)`
                        }}
                      >
                        <img
                          src={pair.backDoc.cleanedImage}
                          alt="Back"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-muted-foreground">
                          Q: {pair.backDoc.qualityScore}%
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => rotateDocument(pair.backDoc.id, true, false)}
                        >
                          <RotateCw className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Single Documents */}
        {localSingleDocs.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Single Documents ({localSingleDocs.length})
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {localSingleDocs.map(doc => (
                <Card key={doc.id} className="p-3">
                  <div 
                    className="relative aspect-[3/2] rounded border overflow-hidden bg-muted mb-2"
                    style={{
                      transform: `rotate(${doc.rotation}deg)`
                    }}
                  >
                    <img
                      src={doc.cleanedImage}
                      alt={doc.detectedType}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <p className="text-xs font-medium truncate mb-1">
                    {documentService.formatDocumentType(doc.detectedType)}
                  </p>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Q: {doc.qualityScore}%
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => rotateDocument(doc.id, false)}
                    >
                      <RotateCw className="w-3 h-3" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Continue Button */}
      <div className="mt-4">
        <Button
          onClick={onContinue}
          className="w-full gap-2"
          size="lg"
        >
          Continue to Print Setup
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default Step4Review;
