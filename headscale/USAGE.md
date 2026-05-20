# Headscale VPN Usage

Self-hosted Tailscale coordination server running at `vpn.jonahsussman.net`. Devices on the mesh network use MagicDNS names under `wicker.lan`.

## Connecting a new device

1. Install the Tailscale client on the device
2. Point it at your Headscale server:
   ```bash
   tailscale up --login-server https://vpn.jonahsussman.net
   ```
3. Authenticate via Google SSO (with MFA)
4. Approve the device:
   ```bash
   docker compose exec headscale headscale nodes list
   docker compose exec headscale headscale nodes approve <node-id>
   ```

The device gets a stable IP (100.x.y.z) and is reachable at `<hostname>.wicker.lan`.

## Pre-auth keys

Skip the manual approval step by generating a pre-auth key:

```bash
# Single-use key, expires in 24 hours
docker compose exec headscale headscale preauthkeys create -e 24h -u <username>
```

Use it on the client:

```bash
tailscale up --login-server https://vpn.jonahsussman.net --authkey <key>
```

## Headscale-UI

Web dashboard at `https://vpn.jonahsussman.net/web/`.

Generate an API key for the UI:

```bash
docker compose exec headscale headscale apikeys create
```

Paste the key into the UI settings page. The key is stored in your browser's local storage.

## Managing devices

```bash
# List all nodes
docker compose exec headscale headscale nodes list

# Remove a node
docker compose exec headscale headscale nodes delete -i <node-id>

# List users
docker compose exec headscale headscale users list
```

## ACL policy

Edit `headscale/acl.hujson` to control who can access what. The current policy allows all authenticated members full access. To restrict:

```hjson
{
  "groups": {
    "group:admins": ["jonah"],
    "group:friends": ["friend1", "friend2"],
  },

  "acls": [
    {
      "action": "accept",
      "src": ["group:admins"],
      "dst": ["*:*"],
    },
    {
      // Friends can only reach Minecraft
      "action": "accept",
      "src": ["group:friends"],
      "dst": ["minecraft:25565"],
    },
  ],
}
```

After editing, restart Headscale to apply:

```bash
docker compose restart headscale
```

## Hosting private services via Tailscale sidecar

To run a service on the VPS that's only accessible over the VPN (not publicly via nginx), use the Tailscale sidecar container pattern.

### 1. Generate a pre-auth key

```bash
docker compose exec headscale headscale preauthkeys create -e 1h -u <username>
```

### 2. Add the sidecar and service to docker-compose.yaml

```yaml
my-app-tailscale:
  image: tailscale/tailscale:latest
  hostname: my-app             # becomes my-app.wicker.lan
  cap_add:
    - NET_ADMIN
    - SYS_MODULE
  volumes:
    - my-app-ts-state:/var/lib/tailscale
  environment:
    - TS_AUTHKEY=tskey-auth-xxx   # from step 1
    - TS_LOGIN_SERVER=https://vpn.jonahsussman.net
    - TS_STATE_DIR=/var/lib/tailscale
  networks:
    - internal

my-app:
  image: whatever
  network_mode: service:my-app-tailscale  # shares tailscale's network
  depends_on:
    - my-app-tailscale
```

Add the volume:

```yaml
volumes:
  my-app-ts-state: {}
```

### 3. Access the service

From any device on the VPN:

```
http://my-app.wicker.lan:<port>
```

The service has no public exposure - no nginx route, no port forwarding. Only VPN-connected devices can reach it.

### Notes

- `network_mode: service:...` means the app container shares the Tailscale container's network namespace. The app's ports are on the Tailscale IP, not the host.
- The `TS_AUTHKEY` is single-use and short-lived. After the first connection, the Tailscale state is persisted in the volume, so the key is no longer needed. You can remove it from docker-compose.yaml after initial setup.
- The app container cannot also be on the `internal` Docker network when using `network_mode`. If it needs to reach other Docker services, route through the Tailscale network or use a different approach.
