import net from "node:net";

/**
 * Preferred port for each service. These stay stable in the normal case — the
 * allocator only moves a service when its preferred port is genuinely taken.
 */
export const SERVICES = [
  { key: "web", envVar: "WEB_PORT", preferred: 3000, label: "web" },
  { key: "nest", envVar: "NEST_PORT", preferred: 3001, label: "api-nest" },
  { key: "hono", envVar: "HONO_PORT", preferred: 3002, label: "api-hono" },
];

const MAX_ATTEMPTS = 50;

/**
 * Resolves when `port` can actually be bound. Mirrors how the apps themselves
 * listen (no host argument, so dual-stack IPv4+IPv6) — probing any other way
 * can report a port free that the real server then fails to bind.
 */
function isPortFree(port) {
  return new Promise((resolve) => {
    const probe = net.createServer();
    probe.once("error", () => resolve(false));
    probe.once("listening", () => probe.close(() => resolve(true)));
    probe.listen(port);
  });
}

/**
 * Picks a port for every service before any of them start, so each one can be
 * told about all the others.
 *
 * Deliberately two passes. A single greedy pass lets a displaced service steal
 * the next service's preferred port and cascade the whole range — if :3000 is
 * busy, web would take :3001 and push api-nest off a port that was free all
 * along. Claiming every available preferred port first keeps each service on
 * its usual number and moves only the one that is actually blocked.
 */
export async function allocatePorts() {
  const taken = new Set();
  const allocated = {};

  // Pass 1: everyone whose own preferred port is available keeps it.
  for (const service of SERVICES) {
    if (await isPortFree(service.preferred)) {
      taken.add(service.preferred);
      allocated[service.key] = { ...service, port: service.preferred, moved: false };
    }
  }

  // Pass 2: place the blocked services, skipping every port claimed above and
  // every other service's preferred port so a later run stays predictable.
  const reserved = new Set(SERVICES.map((service) => service.preferred));
  for (const service of SERVICES) {
    if (allocated[service.key]) continue;

    let port = service.preferred + 1;
    let attempts = 0;

    while (taken.has(port) || reserved.has(port) || !(await isPortFree(port))) {
      port += 1;
      attempts += 1;
      if (attempts > MAX_ATTEMPTS) {
        throw new Error(
          `Could not find a free port for ${service.label} within ${MAX_ATTEMPTS} of ${service.preferred}.`,
        );
      }
    }

    taken.add(port);
    allocated[service.key] = { ...service, port, moved: true };
  }

  return allocated;
}
