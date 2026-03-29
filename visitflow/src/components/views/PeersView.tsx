'use client';

import { motion } from 'framer-motion';
import { Users, Heart, MessageSquare, Trophy, TrendingUp } from 'lucide-react';
import { MOCK_PEERS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

export function PeersView() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold">Peer Support</h1>
        <p className="text-sm text-muted-foreground">Recovery companions who understand the journey</p>
      </div>

      <div className="glass-card rounded-2xl p-4 border border-primary/15 mb-6 flex gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
          <Users className="w-5 h-5 text-primary" />
        </div>
        <div>
          <div className="font-medium text-sm mb-0.5">Trusted Peer Network</div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            These are real cardiac rehab graduates who chose to share their journey.
            Their messages are personal, not scripted — because recovery is human.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {MOCK_PEERS.map((peer, i) => (
          <motion.div
            key={peer.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card rounded-2xl p-5 border border-border"
          >
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/30 to-primary/5 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                {peer.name[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">{peer.name}</span>
                  <span className="text-xs text-muted-foreground">Week {peer.weekInProgram} in program</span>
                </div>
                {peer.milestone && (
                  <div className="flex items-center gap-1.5 mb-2">
                    <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                    <span className="text-xs text-yellow-400">{peer.milestone}</span>
                  </div>
                )}
                {peer.message && (
                  <div className="glass rounded-xl p-3 text-sm text-muted-foreground leading-relaxed border border-border/50">
                    &ldquo;{peer.message}&rdquo;
                  </div>
                )}
                <div className="flex items-center gap-3 mt-3">
                  <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <Heart className="w-3.5 h-3.5" />
                    Thank them
                  </button>
                  <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Reply
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 glass-card rounded-2xl p-5 border border-border">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm">Community Progress</span>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { value: '284', label: 'Active members' },
            { value: '91%', label: 'Complete Week 6' },
            { value: '3.2×', label: 'Better outcomes' },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-2xl font-bold text-gradient mb-0.5">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
