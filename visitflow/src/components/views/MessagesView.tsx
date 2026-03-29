'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Brain, Stethoscope, User, Send, AlertTriangle, Zap, Bell } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { detectEscalation } from '@/lib/ai-service';
import type { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { MOCK_SYMPTOMS } from '@/lib/mock-data';

function MessageBubble({ msg }: { msg: Message }) {
  const isPatient = msg.from === 'patient';
  const isAI = msg.from === 'ai';

  const config = {
    doctor: { icon: Stethoscope, label: 'Dr. Okafor', color: 'text-primary', bg: 'bg-primary/10 border-primary/15' },
    ai: { icon: Brain, label: 'AI Assistant', color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/15' },
    patient: { icon: User, label: 'You', color: 'text-foreground', bg: 'bg-secondary border-border' },
  };
  const cfg = config[msg.from];
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex gap-3', isPatient && 'flex-row-reverse')}
    >
      <div className={cn('w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1',
        isAI ? 'bg-purple-400/20' : isPatient ? 'bg-secondary' : 'bg-primary/20'
      )}>
        <Icon className={cn('w-3.5 h-3.5', cfg.color)} />
      </div>
      <div className={cn('max-w-[75%]', isPatient && 'items-end flex flex-col')}>
        <div className="text-xs text-muted-foreground mb-1">
          {cfg.label} · {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          {msg.aiSuggested && <span className="ml-2 text-purple-400">AI suggested</span>}
        </div>
        <div className={cn('px-3.5 py-2.5 rounded-2xl border text-sm leading-relaxed', cfg.bg)}>
          {msg.text}
        </div>
        {msg.linkedTo && (
          <div className="mt-1 text-xs text-muted-foreground/60 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-primary/40" />
            Linked to: {msg.linkedTo.type}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function AlertPanel() {
  const { alerts, currentHR, addAlert } = useAppStore();
  const [simulated, setSimulated] = useState(false);

  const triggerRedAlert = () => {
    const escalation = detectEscalation({
      symptoms: ['chest pain', 'shortness of breath'],
      heartRate: 148,
      alertHistory: 3,
    });

    if (escalation.level !== 'none') {
      addAlert({
        id: `a-sim-${Date.now()}`,
        timestamp: new Date(),
        level: escalation.level as 'yellow' | 'orange' | 'red',
        message: escalation.message,
        source: 'symptom',
        acknowledged: false,
        sentToContacts: escalation.level === 'red',
      });
      setSimulated(true);
    }
  };

  const levelColors = {
    green: 'border-emerald-400/20 bg-emerald-400/5 text-emerald-400',
    yellow: 'border-yellow-400/20 bg-yellow-400/5 text-yellow-400',
    orange: 'border-orange-400/20 bg-orange-400/5 text-orange-400',
    red: 'border-red-500/30 bg-red-500/10 text-red-400',
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Alert History</span>
        </div>
        <button
          onClick={triggerRedAlert}
          className="text-xs px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors flex items-center gap-1"
        >
          <AlertTriangle className="w-3 h-3" />
          Demo Alert
        </button>
      </div>

      {alerts.map((alert) => (
        <motion.div
          key={alert.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className={cn('rounded-xl p-3 border text-xs', levelColors[alert.level])}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="leading-relaxed">{alert.message}</p>
            <div className={cn('w-2 h-2 rounded-full mt-0.5 flex-shrink-0',
              alert.level === 'red' ? 'bg-red-400 animate-pulse' :
              alert.level === 'orange' ? 'bg-orange-400 animate-pulse' :
              alert.level === 'yellow' ? 'bg-yellow-400' : 'bg-emerald-400'
            )} />
          </div>
          <div className="mt-1.5 opacity-60">{alert.timestamp.toLocaleString()}</div>
          {alert.sentToContacts && (
            <div className="mt-1.5 font-medium">✓ Sent to trusted contacts</div>
          )}
        </motion.div>
      ))}

      <AnimatePresence>
        {simulated && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-xl p-3 border border-red-500/30 bg-red-500/10 text-red-400 text-xs"
          >
            <div className="font-semibold mb-1">🚨 Alert sent to contacts</div>
            <div className="text-red-300/80">&quot;Maria reported chest discomfort and elevated HR. Please check on her.&quot;</div>
            <div className="mt-1.5 opacity-60">Notified: Carlos Santos, Dr. Okafor</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function MessagesView() {
  const { messages, addMessage } = useAppStore();
  const [input, setInput] = useState('');
  const [aiSuggestions] = useState([
    'What should I do if I feel chest tightness during a walk?',
    'Is it safe to take metoprolol with my other medication?',
    'My next appointment is April 12 — what should I prepare?',
  ]);

  const sendMessage = () => {
    if (!input.trim()) return;
    addMessage({
      id: `m-${Date.now()}`,
      from: 'patient',
      text: input.trim(),
      timestamp: new Date(),
    });
    setInput('');

    // AI auto-reply
    setTimeout(() => {
      addMessage({
        id: `m-ai-${Date.now()}`,
        from: 'ai',
        text: "I've noted your question and will share it with Dr. Okafor's team. Based on your visit notes, this relates to your current recovery protocol. Would you like me to draft a formal follow-up question?",
        timestamp: new Date(),
        aiSuggested: true,
      });
    }, 1200);
  };

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Messages</h1>
          <p className="text-sm text-muted-foreground">Doctor · AI Assistant · Care team</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-[1fr_300px] gap-6 min-h-0">
        {/* Chat */}
        <div className="flex flex-col glass-card rounded-2xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-primary" />
            </div>
            <div>
              <div className="text-sm font-medium">Dr. Okafor</div>
              <div className="text-xs text-muted-foreground">Cardiology · Typically replies within a few hours</div>
            </div>
            <div className="ml-auto w-2 h-2 rounded-full bg-emerald-400" />
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 transcript-scroll">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
          </div>

          {/* AI suggestions */}
          <div className="px-4 py-2 border-t border-border">
            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
              {aiSuggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-400/10 border border-purple-400/15 text-xs text-purple-400 hover:bg-purple-400/20 transition-colors"
                >
                  <Zap className="w-3 h-3" />
                  {s.length > 40 ? s.slice(0, 40) + '…' : s}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-border flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Message Dr. Okafor or ask AI..."
              className="flex-1 bg-secondary/30 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary/50 placeholder:text-muted-foreground/50"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Alerts */}
        <div className="overflow-y-auto">
          <AlertPanel />
        </div>
      </div>
    </div>
  );
}
