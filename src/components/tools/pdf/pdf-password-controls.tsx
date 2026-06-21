"use client";

import { motion } from "framer-motion";
import { Lock, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function PdfPasswordControls(): React.ReactElement {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <Card className="border-border bg-card">
        <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-orange-500/15 border border-orange-500/30 flex items-center justify-center">
              <Clock className="h-3.5 w-3.5 text-orange-500" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold tracking-tight">Coming Soon</h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              We are working on adding full PDF encryption support in a future update.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-yellow-500/30 bg-yellow-500/5">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Why is this not available yet?</p>
            <p className="mt-1">
              pdf-lib does not support PDF encryption. True password protection requires AES or RC4
              encryption at the PDF spec level. We are working on adding full PDF encryption support
              in a future update.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
