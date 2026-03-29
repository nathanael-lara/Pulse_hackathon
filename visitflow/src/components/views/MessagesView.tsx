'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Stethoscope, User, Send, AlertTriangle, Bell, Mic, Link2, Sparkles } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { detectEscalation } from '@/lib/ai-service';
import type { Message } from '@/lib/types';
import { cn } from '@/lib/utils';

function MessageBubble({ msg }: { msg: Message }) {
  const config = {
    doctor: { icon: Stethoscope, label: 'Dr. Okafor', bg: 'bg-primary/10 border-primary/15', tone: 'text-primary' },
    ai: { icon: Brain, label: 'AI assistant', bg: 'bg-purple-400/10 border-purple-400/15', tone: 'text-purple-300' },
    patient: { icon: User, label: 'Maria', bg: 'bg-white/[0.04] border-white/10', tone: 'text-foreground' },
  };
  const cfg = config[msg.from];
  const Icon = cfg.icon;
  const isPatient = msg.from === 'patient';

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cn('flex gap-3', isPatient && 'flex-row-reverse')}>
      <div className={cn('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1', isPatient ? 'bg-white/[0.05]' : msg.from === 'doctor' ? 'bg-primary/15' : 'bg-purple-400/15')}>
        <Icon className={cn('w-4 h-4', cfg.tone)} />
      </div>
      <div className={cn('max-w-[78%]', isPatient && 'flex flex-col items-end')}>
        <div className="mb-1 text-xs text-muted-foreground">
          {cfg.label} · {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className={cn('rounded-[1.35rem] border px-4 py-3 text-sm leading-relaxed', cfg.bg)}>
          {msg.text}
          {msg.voiceNote && (
            <div className="mt-3 rounded-xl border border-white/8 bg-black/15 p-3">
              <div className="mb-1 flex items-center gap-2 text-xs text-primary">
                <Mic className="w-3 h-3" />
                Voice note · {msg.voiceNote.durationSec}s
              </div>
              <div className="text-xs text-muted-foreground">{msg.voiceNote.transcript}</div>
            </div>
          )}
        </div>
        {msg.linkedTo && (
          <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1 text-[11px] text-muted-foreground">
            <Link2 className="w-3 h-3" />
            Linked to {msg.linkedTo.type}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function MessagesView() {
  const { messages, addMessage, alerts, addAlert, addNotification } = useAppStore();
  const [input, setInput] = useState('');
  const [recordingVoice, setRecordingVoice] = useState(false);
  const [selectedContext, setSelectedContext] = useState<'visit' | 'medication' | 'rehab' | 'alert'>('visit');

  const aiSuggestions = [
    'Draft a message asking whether today’s shortness of breath changes the rehab plan.',
    'Summarize the visit in one message for a family caregiver.',
    'Turn my concern into a calm question for the doctor.',
  ];

  const sendMessage = () => {
    if (!input.trim()) return;
    addMessage({
      id: `m-${Date.now()}`,
      from: 'patient',
      text: input.trim(),
      timestamp: new Date(),
      linkedTo: { type: selectedContext, id: `${selectedContext}-context` },
    });
    setInput('');

    setTimeout(() => {
      addMessage({
        id: `m-ai-${Date.now()}`,
        from: 'ai',
        text: 'I drafted a cleaner version for the care team and linked it to the right part of your recovery journey. Would you like me to forward it as-is?',
        timestamp: new Date(),
        aiSuggested: true,
        linkedTo: { type: selectedContext, id: `${selectedContext}-context` },
      });
    }, 900);
  };

  const recordVoice = () => {
    setRecordingVoice(true);
    setTimeout(() => {
      setRecordingVoice(false);
      addMessage({
        id: `m-voice-${Date.now()}`,
        from: 'patient',
        text: 'Sending a voice check-in about rehab symptoms after today’s walk.',
        timestamp: new Date(),
        linkedTo: { type: 'rehab', id: 'r-003' },
        voiceNote: {
          durationSec: 16,
          transcript: 'I got more winded than usual during the second half of my walk and wanted to ask if I should slow down tomorrow.',
        },
      });
    }, 1200);
  };

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
      addNotification({
        id: `n-alert-${Date.now()}`,
        title: 'Critical alert triggered',
        body: escalation.message,
        category: 'alert',
        channel: 'sms',
        level: escalation.level as 'yellow' | 'orange' | 'red',
        timestamp: new Date(),
        read: false,
      });
    }
  };

  return (
    <div className="h-full p-6">
      <div className="mb-7 flex items-end justify-between gap-4">
        <div>
          <div className="editorial-kicker text-primary mb-2">Support channel</div>
          <h1 className="text-3xl font-bold tracking-tight">Messages + Voice</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Text, voice, AI drafting, and context-aware communication tied to visits, meds, rehab, and alerts.
          </p>
        </div>
        <button
          onClick={triggerRedAlert}
          className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200 hover:bg-red-500/15 transition-colors flex items-center gap-2"
        >
          <AlertTriangle className="w-4 h-4" />
          Demo alert
        </button>
      </div>

      <div className="grid h-[calc(100%-5rem)] gap-5 xl:grid-cols-[1fr_340px]">
        <div className="glass-card flex min-h-0 flex-col rounded-[1.75rem] border border-white/10 overflow-hidden">
          <div className="border-b border-white/8 px-5 py-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Care conversation</div>
              <div className="text-xs text-muted-foreground mt-1">Doctor, AI assistant, and patient support in one thread</div>
            </div>
            <div className="flex gap-2">
              {(['visit', 'medication', 'rehab', 'alert'] as const).map((item) => (
                <button
                  key={item}
                  onClick={() => setSelectedContext(item)}
                  className={cn(
                    'rounded-full px-2.5 py-1 text-[11px] border transition-colors',
                    selectedContext === item ? 'border-primary/20 bg-primary/10 text-primary' : 'border-white/10 bg-white/[0.03] text-muted-foreground'
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4 transcript-scroll">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
          </div>

          <div className="border-t border-white/8 p-4 space-y-3">
            <div className="flex gap-2 overflow-x-auto scrollbar-none">
              {aiSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="flex-shrink-0 rounded-full border border-purple-400/20 bg-purple-400/10 px-3 py-1.5 text-xs text-purple-200 hover:bg-purple-400/15 transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3" />
                  {suggestion.length > 50 ? `${suggestion.slice(0, 50)}…` : suggestion}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={recordVoice}
                className={cn(
                  'w-11 h-11 rounded-2xl border flex items-center justify-center transition-colors',
                  recordingVoice ? 'border-primary/30 bg-primary/15 text-primary pulse-ring' : 'border-white/10 bg-white/[0.03] text-muted-foreground hover:text-foreground'
                )}
              >
                <Mic className="w-4 h-4" />
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Write a message or let AI help draft one..."
                className="flex-1 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none focus:border-primary/35"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="w-11 h-11 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4 overflow-y-auto">
          <div className="glass-card rounded-[1.75rem] p-5 border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">AI drafting assist</span>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
                Converts casual messages into clearer doctor-facing questions.
              </div>
              <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
                Carries message context from live visit, medication, rehab, and alerts.
              </div>
              <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
                Voice notes are transcribed and sent alongside the original audio intent.
              </div>
            </div>
          </div>

          <div className="glass-card rounded-[1.75rem] p-5 border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Alert history</span>
            </div>
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div key={alert.id} className={cn(
                  'rounded-xl border p-3 text-sm',
                  alert.level === 'red' ? 'border-red-500/20 bg-red-500/10 text-red-100'
                    : alert.level === 'orange' ? 'border-orange-400/20 bg-orange-400/10 text-orange-100'
                    : alert.level === 'yellow' ? 'border-yellow-400/20 bg-yellow-400/10 text-yellow-100'
                    : 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100'
                )}>
                  <div>{alert.message}</div>
                  <div className="mt-1 text-xs opacity-70">{alert.timestamp.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
