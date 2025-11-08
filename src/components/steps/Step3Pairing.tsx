// src/components/steps/Step3Pairing.tsx

import { useState, useEffect } from "react";
import { ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { documentService } from "@/services/documentService";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { 
  CleanedDocument, 
  PairedIDCard, 
  UnpairedIDCard 
} from "@/types";

interface Step3PairingProps {
  cleanedDocuments: CleanedDocument[];
  onPairingComplete: (
    pairedIDs: PairedIDCard[], 
    singleDocs: CleanedDocument[]
  ) => void;
}

const Step3Pairing = ({ 
  cleanedDocuments, 
  onPairingComplete 
}: Step3PairingProps) => {
  const { toast } = useToast();
  const [pairedIDs, setPairedIDs] = useState<PairedIDCard[]>([]);
  const [unpairedIDs, setUnpairedIDs] = useState<UnpairedIDCard[]>([]);
  const [singleDocs, setSingleDocs] = useState<CleanedDocument[]>([]);
  const [selectedForPairing, setSelectedForPairing] = useState<{
    front?: string;
    back?: string;
  }>({});
  const [isPairing, setIsPairing] = useState(false);

  useEffect(() => {
    performAutoPairing();
  }, []);

  const performAutoPairing = async () => {
    setIsPairing(true);

    try {
      // Separate ID cards from single documents
      const idCards = documentService.filterByCategory(cleanedDocuments, 'id_card');
      const singles = documentService.filterByCategory(cleanedDocuments, 'single_document');

      setSingleDocs(singles);

      if (idCards.length === 0) {
        setIsPairing(false);
        // Auto-proceed if no ID cards to pair
        setTimeout(() => {
          onPairingComplete([], singles);
        }, 500);
        return;
      }

      // Call backend auto-pairing
      const result = await apiService.autoPairIDCards(idCards.map(d => d.id));

      if (!result.success || !result.data) {
        throw new Error(result.error || "Auto-pairing failed");
      }

      setPairedIDs(result.data.paired);
      setUnpairedIDs(result.data.unpaired);

      toast({
        title: "Auto-pairing complete",
        description: `${result.data.paired.length} pairs matched, ${result.data.unpaired.length} cards need manual pairing`,
      });

    } catch (error) {
      toast({
        title: "Auto-pairing failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsPairing(false);
    }
  };

  const handleCardSelect = (cardId: string, side: 'front' | 'back') => {
    setSelectedForPairing(prev => {
      const newSelection = { ...prev, [side]: cardId };

      // If both front and back selected, auto-pair them
      if (newSelection.front && newSelection.back) {
        handleManualPair(newSelection.front, newSelection.back);
        return {};
      }

      return newSelection;
    });
  };

  const handleManualPair = (frontId: string, backId: string) => {
    const frontCard = unpairedIDs.find(u => u.document.id === frontId);
    const backCard = unpairedIDs.find(u => u.document.id === backId);

    if (!frontCard || !backCard) {
      toast({
        title: "Pairing failed",
        description: "Selected documents not found",
        variant: "destructive",
      });
      return;
    }

    // Validate compatibility
    if (!documentService.canPair(frontCard.document, backCard.document)) {
      toast({
        title: "Cannot pair",
        description: "Selected documents are not compatible for pairing",
        variant: "destructive",
      });
      return;
    }

    // Create pair
    const newPair: PairedIDCard = {
      id: `pair_${Date.now()}`,
      frontDoc: frontCard.document,
      backDoc: backCard.document,
      confidence: 100,
      pairingMethod: 'manual',
      status: 'paired'
    };

    setPairedIDs(prev => [...prev, newPair]);
    setUnpairedIDs(prev => prev.filter(u =>
      u.document.id !== frontId && u.document.id !== backId
    ));

    toast({
      title: "Paired successfully",
      description: "Documents paired manually",
    });
  };

  const handleUnpair = (pairId: string) => {
    const pair = pairedIDs.find(p => p.id === pairId);
    if (!pair) return;

    // Move back to unpaired
    setUnpairedIDs(prev => [
      ...prev,
      {
        id: `unpaired_front_${Date.now()}`,
        document: pair.frontDoc,
        side: 'front',
        status: 'unpaired',
        reason: 'no_match'
      },
      {
        id: `unpaired_back_${Date.now()}`,
        document: pair.backDoc,
        side: 'back',
        status: 'unpaired',
        reason: 'no_match'
      }
    ]);

    setPairedIDs(prev => prev.filter(p => p.id !== pairId));

    toast({
      title: "Unpaired",
      description: "Documents moved back to manual pairing section",
    });
  };

  const handleContinue = () => {
    if (unpairedIDs.length > 0) {
      toast({
        title: "Unpaired cards remaining",
        description: `Please pair ${unpairedIDs.length} remaining cards first`,
        variant: "destructive",
      });
      return;
    }

    onPairingComplete(pairedIDs, singleDocs);
  };

  if (isPairing) {
    return (
      <div className="h-[calc(100vh-180px)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Auto-pairing ID cards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-180px)] flex flex-col p-4">
      {/* Summary */}
      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Paired IDs</p>
              <p className="text-2xl font-bold text-success">{pairedIDs.length}</p>
            </div>
            <Separator orientation="vertical" className="h-12" />
            <div>
              <p className="text-sm text-muted-foreground">Need Pairing</p>
              <p className="text-2xl font-bold text-warning">{unpairedIDs.length}</p>
            </div>
            <Separator orientation="vertical" className="h-12" />
            <div>
              <p className="text-sm text-muted-foreground">Single Docs</p>
              <p className="text-2xl font-bold text-primary">{singleDocs.length}</p>
            </div>
          </div>

          {selectedForPairing.front && (
            <Badge variant="secondary">
              {selectedForPairing.back ? 'Click to pair' : 'Front selected - Select back'}
            </Badge>
          )}
          {selectedForPairing.back && !selectedForPairing.front && (
            <Badge variant="secondary">
              Back selected - Select front
            </Badge>
          )}
        </div>
      </Card>

      {/* Content */}
      <div className="flex-1 overflow-auto space-y-6">
        {/* Auto-Paired IDs */}
        {pairedIDs.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 text-success" />
              <h3 className="text-lg font-semibold">Auto-Paired ID Cards ({pairedIDs.length})</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pairedIDs.map(pair => (
                <Card key={pair.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">
                        {documentService.formatDocumentType(pair.frontDoc.detectedType).replace(' (Front)', '')}
                      </Badge>
                      <Badge variant={pair.confidence >= 85 ? "default" : "secondary"}>
                        {pair.confidence}% match
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Front</p>
                        <img
                          src={pair.frontDoc.cleanedImage}
                          alt="Front"
                          className="w-full aspect-[3/2] object-cover rounded border"
                        />
                        <p className="text-xs text-center mt-1">
                          Q: {pair.frontDoc.qualityScore}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Back</p>
                        <img
                          src={pair.backDoc.cleanedImage}
                          alt="Back"
                          className="w-full aspect-[3/2] object-cover rounded border"
                        />
                        <p className="text-xs text-center mt-1">
                          Q: {pair.backDoc.qualityScore}%
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleUnpair(pair.id)}
                    >
                      Unpair
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Unpaired IDs - Need Manual Pairing */}
        {unpairedIDs.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-warning" />
              <h3 className="text-lg font-semibold">Need Manual Pairing ({unpairedIDs.length} cards)</h3>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              Select one FRONT card, then select one BACK card to pair them
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {unpairedIDs.map(unpaired => {
                const isSelected = 
                  selectedForPairing.front === unpaired.document.id ||
                  selectedForPairing.back === unpaired.document.id;

                return (
                  <Card
                    key={unpaired.id}
                    className={`p-3 cursor-pointer transition-all ${
                      isSelected 
                        ? 'ring-2 ring-primary' 
                        : 'hover:ring-2 hover:ring-primary/50'
                    }`}
                    onClick={() => handleCardSelect(unpaired.document.id, unpaired.side)}
                  >
                    <Badge variant="outline" className="mb-2 text-xs">
                      {unpaired.side.toUpperCase()}
                    </Badge>

                    <img
                      src={unpaired.document.cleanedImage}
                      alt={unpaired.side}
                      className="w-full aspect-[3/2] object-cover rounded border mb-2"
                    />

                    <p className="text-xs font-medium truncate">
                      {documentService.formatDocumentType(unpaired.document.detectedType)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Quality: {unpaired.document.qualityScore}%
                    </p>

                    {isSelected && (
                      <Badge variant="secondary" className="w-full mt-2 justify-center">
                        Selected
                      </Badge>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Single Documents */}
        {singleDocs.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">
                Single Documents ({singleDocs.length}) - No Pairing Needed
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {singleDocs.map(doc => (
                <Card key={doc.id} className="p-3">
                  <img
                    src={doc.cleanedImage}
                    alt={doc.detectedType}
                    className="w-full aspect-[3/2] object-cover rounded border mb-2"
                  />

                  <p className="text-xs font-medium truncate">
                    {documentService.formatDocumentType(doc.detectedType)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Quality: {doc.qualityScore}%
                  </p>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Continue Button */}
      <div className="mt-4">
        <Button
          onClick={handleContinue}
          disabled={unpairedIDs.length > 0}
          className="w-full gap-2"
          size="lg"
        >
          {unpairedIDs.length > 0 
            ? `Pair ${unpairedIDs.length} remaining cards first`
            : `Continue with ${pairedIDs.length} pairs + ${singleDocs.length} singles`
          }
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default Step3Pairing;
