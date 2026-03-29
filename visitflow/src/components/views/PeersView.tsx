'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Heart,
  MessageSquare,
  Trophy,
  Car,
  MapPin,
  Hospital,
  Stethoscope,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import {
  CARE_LOCATIONS,
  CURRENT_VISIT,
  GOOGLE_MAPS_SIM_10024,
  MOCK_PEERS,
  PROVIDER_MATCHES,
  TRANSPORT_MATCHES,
} from '@/lib/mock-data';
import { generateCommunityTransportSupport } from '@/lib/ai-service';

type TripPurpose = 'rehab-center' | 'cardiologist' | 'hospital';

export function PeersView() {
  const [zipCode, setZipCode] = useState('10024');
  const [tripPurpose, setTripPurpose] = useState<TripPurpose>('rehab-center');
  const [supportPlan, setSupportPlan] = useState<string[]>([
    'Enter ZIP 10024 to simulate a community transport plan grounded in local route and provider data.',
    'The matching flow will stay aligned with Dr. Okafor’s current rehab and follow-up instructions.',
  ]);
  const [isLoadingPlan, setIsLoadingPlan] = useState(false);

  const filteredLocations = useMemo(
    () => CARE_LOCATIONS.filter((location) => location.zipCode === '10024'),
    []
  );

  const providerOptions = useMemo(() => {
    if (tripPurpose === 'hospital') {
      return filteredLocations.filter((location) => location.kind === 'hospital');
    }
    return PROVIDER_MATCHES.filter((provider) =>
      tripPurpose === 'rehab-center'
        ? provider.specialty.toLowerCase().includes('rehab')
        : provider.specialty.toLowerCase().includes('cardiology')
    );
  }, [filteredLocations, tripPurpose]);

  const suggestedRideOptions = useMemo(
    () =>
      TRANSPORT_MATCHES.filter((match) =>
        match.supports?.includes(
          tripPurpose === 'hospital'
            ? 'hospital'
            : tripPurpose === 'cardiologist'
              ? 'cardiology'
              : 'rehab'
        )
      ),
    [tripPurpose]
  );

  async function handleGeneratePlan() {
    setIsLoadingPlan(true);
    try {
      const plan = await generateCommunityTransportSupport({
        zipCode,
        tripPurpose,
        context: [
          CURRENT_VISIT.summary?.diagnosis.join(', '),
          CURRENT_VISIT.summary?.instructions.join('; '),
          CURRENT_VISIT.summary?.followUp,
        ]
          .filter(Boolean)
          .join(' | '),
      });

      const bullets = plan
        .split('\n')
        .map((line) => line.replace(/^[-•\s]+/, '').trim())
        .filter(Boolean);
      setSupportPlan(bullets.length ? bullets : [plan]);
    } finally {
      setIsLoadingPlan(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl p-4">
      <div className="mb-7">
        <div className="editorial-kicker mb-2 text-primary">Community care</div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Family & Support</h1>
        <p className="mt-1 text-sm text-foreground/72">
          Recovery companions, provider matching, and trusted transport support designed around care continuity.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_0.96fr]">
        <div className="space-y-5">
          <div className="glass-card rounded-[1.75rem] p-5">
            <div className="mb-4 flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <div className="text-base font-semibold text-foreground">Trusted recovery companions</div>
                <div className="mt-1 text-sm text-foreground/70">
                  Peer encouragement, accountability, and check-ins from people who understand recovery.
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {MOCK_PEERS.map((peer, i) => (
                <motion.div
                  key={peer.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-[1.35rem] border border-border bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/12 text-sm font-bold text-primary">
                      {peer.name[0]}
                    </div>
                    <div className="flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{peer.name}</span>
                        <span className="text-xs text-foreground/55">Week {peer.weekInProgram}</span>
                        {peer.trustLabel ? (
                          <span className="rounded-full border border-border bg-secondary px-2 py-0.5 text-[11px] text-primary">
                            {peer.trustLabel}
                          </span>
                        ) : null}
                      </div>
                      {peer.milestone ? (
                        <div className="mb-2 flex items-center gap-1.5 text-xs text-[#8f71b8]">
                          <Trophy className="h-3.5 w-3.5" />
                          {peer.milestone}
                        </div>
                      ) : null}
                      {peer.message ? (
                        <div className="rounded-xl border border-border bg-secondary/40 p-3 text-sm leading-relaxed text-foreground/78">
                          &ldquo;{peer.message}&rdquo;
                        </div>
                      ) : null}
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-foreground/60">
                        {peer.location ? (
                          <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{peer.location}</span>
                        ) : null}
                        <button className="flex items-center gap-1.5 transition-colors hover:text-foreground">
                          <Heart className="h-3.5 w-3.5" />
                          Encourage
                        </button>
                        <button className="flex items-center gap-1.5 transition-colors hover:text-foreground">
                          <MessageSquare className="h-3.5 w-3.5" />
                          Message
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-[1.75rem] p-5">
            <div className="mb-4 flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <div>
                <div className="text-base font-semibold text-foreground">Healthcare provider matching</div>
                <div className="mt-1 text-sm text-foreground/70">
                  Match the patient to local providers who fit the physician’s current diagnosis, rehab limits, and follow-up needs.
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {providerOptions.map((provider) => (
                <div key={provider.id} className="rounded-[1.25rem] border border-border bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-foreground">{provider.name}</div>
                      <div className="mt-1 text-xs uppercase tracking-[0.18em] text-primary">{'specialty' in provider ? provider.specialty : provider.kind}</div>
                    </div>
                    <span className="rounded-full bg-secondary px-2.5 py-1 text-xs text-primary">
                      {'distanceMiles' in provider ? provider.distanceMiles : 0} mi
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-foreground/72">
                    {'matchReason' in provider ? provider.matchReason : provider.summary}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-foreground/58">
                    <span>{'etaMinutes' in provider ? provider.etaMinutes : 0} min away</span>
                    <span>{provider.address}</span>
                    {'acceptingPatients' in provider ? (
                      <span>{provider.acceptingPatients ? 'Accepting patients' : 'Referral required'}</span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="glass-card rounded-[1.75rem] p-5">
            <div className="mb-4 flex items-center gap-2">
              <Car className="h-4 w-4 text-primary" />
              <span className="text-base font-semibold text-foreground">Community transport support</span>
            </div>

            <div className="rounded-[1.35rem] border border-border bg-secondary/35 p-4">
              <div className="mb-3 text-sm text-foreground/75">
                GPT-4o support planner using simulated Google Maps style routing data for ZIP code <span className="font-semibold text-foreground">10024</span>.
              </div>
              <div className="grid gap-3 md:grid-cols-[120px_minmax(0,1fr)]">
                <label className="text-sm font-medium text-foreground">
                  ZIP code
                  <input
                    value={zipCode}
                    onChange={(event) => setZipCode(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-base text-foreground shadow-sm outline-none ring-0"
                  />
                </label>
                <label className="text-sm font-medium text-foreground">
                  Support need
                  <select
                    value={tripPurpose}
                    onChange={(event) => setTripPurpose(event.target.value as TripPurpose)}
                    className="mt-2 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-base text-foreground shadow-sm outline-none"
                  >
                    <option value="rehab-center">Cardiac rehab visit</option>
                    <option value="cardiologist">Cardiology follow-up</option>
                    <option value="hospital">Urgent hospital check</option>
                  </select>
                </label>
              </div>
              <button
                onClick={() => void handleGeneratePlan()}
                className="mt-4 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
              >
                {isLoadingPlan ? 'Building support plan...' : 'Generate support plan'}
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {supportPlan.map((line) => (
                <div key={line} className="flex gap-3 rounded-[1.25rem] border border-border bg-white p-4 shadow-sm">
                  <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                  <div className="text-sm leading-relaxed text-foreground/78">{line}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-3">
              {suggestedRideOptions.map((match) => (
                <div key={match.id} className="rounded-[1.25rem] border border-border bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-foreground">{match.driverName}</div>
                      <div className="mt-1 text-xs text-foreground/58">
                        {match.role === 'peer' ? 'Peer transport support' : 'Community transport partner'}
                      </div>
                    </div>
                    <span className="rounded-full bg-secondary px-2.5 py-1 text-xs text-primary">{match.trustLabel}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-foreground/58">
                    <span>{match.distanceMiles} miles away</span>
                    <span>{match.availability}</span>
                    <span>{match.seats} seats</span>
                    {match.pickupArea ? <span>{match.pickupArea}</span> : null}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-[1.75rem] p-5">
            <div className="mb-4 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-base font-semibold text-foreground">Nearby care discovery</span>
            </div>
            <div className="space-y-3">
              {GOOGLE_MAPS_SIM_10024.filter((location) => location.kind !== 'home').map((location) => (
                <div key={location.placeName} className="rounded-[1.25rem] border border-border bg-white p-4 shadow-sm">
                  <div className="mb-2 flex items-center gap-2">
                    {location.kind === 'hospital' ? (
                      <Hospital className="h-4 w-4 text-[#c85d59]" />
                    ) : location.kind === 'cardiologist' ? (
                      <Stethoscope className="h-4 w-4 text-primary" />
                    ) : (
                      <Heart className="h-4 w-4 text-[#9cc96b]" />
                    )}
                    <span className="text-sm font-semibold text-foreground">{location.placeName}</span>
                  </div>
                  <div className="text-xs text-foreground/58">{location.address}</div>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-foreground/58">
                    <span>{location.distanceMiles} miles</span>
                    <span>{location.etaMinutes} min away</span>
                    <span>{location.source}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
