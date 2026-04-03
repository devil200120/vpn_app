#!/bin/bash
# ============================================================
# ShieldVPN — WireGuard Server Auto-Setup
# Run on a fresh Ubuntu 22.04 VPS as root:
#   curl -sO https://raw.githubusercontent.com/devil200120/vpn_app/main/scripts/setup-vpn-server.sh
#   chmod +x setup-vpn-server.sh && sudo bash setup-vpn-server.sh
# ============================================================
set -e

WG_INTERFACE="wg0"
WG_PORT=51820
WG_NETWORK="10.8.0"
WG_SERVER_IP="${WG_NETWORK}.1"
DNS="1.1.1.1, 8.8.8.8"
SOCKS_PORT=1080

echo ""
echo "╔══════════════════════════════════════╗"
echo "║     ShieldVPN Server Setup v1.0      ║"
echo "╚══════════════════════════════════════╝"
echo ""

# ── 1. Update & install packages ─────────────────────────────
echo "▶ Installing packages..."
apt-get update -qq
apt-get install -y wireguard iptables microsocks curl ufw -qq
echo "✓ Packages installed"

# ── 2. Enable IP forwarding ───────────────────────────────────
echo "▶ Enabling IP forwarding..."
sed -i 's/#net.ipv4.ip_forward=1/net.ipv4.ip_forward=1/' /etc/sysctl.conf
sed -i 's/#net.ipv6.conf.all.forwarding=1/net.ipv6.conf.all.forwarding=1/' /etc/sysctl.conf
sysctl -p -q
echo "✓ IP forwarding enabled"

# ── 3. Detect primary network interface ──────────────────────
IFACE=$(ip route get 8.8.8.8 | awk '{print $5; exit}')
echo "✓ Detected network interface: $IFACE"

# ── 4. Generate WireGuard keys ────────────────────────────────
echo "▶ Generating WireGuard keys..."
mkdir -p /etc/wireguard
chmod 700 /etc/wireguard
wg genkey | tee /etc/wireguard/server_private.key | wg pubkey > /etc/wireguard/server_public.key
chmod 600 /etc/wireguard/server_private.key
SERVER_PRIVATE=$(cat /etc/wireguard/server_private.key)
SERVER_PUBLIC=$(cat /etc/wireguard/server_public.key)
echo "✓ Keys generated"

# ── 5. Create WireGuard config ────────────────────────────────
echo "▶ Creating WireGuard config..."
cat > /etc/wireguard/${WG_INTERFACE}.conf << EOF
[Interface]
Address = ${WG_SERVER_IP}/24
PrivateKey = ${SERVER_PRIVATE}
ListenPort = ${WG_PORT}
PostUp   = iptables -A FORWARD -i ${WG_INTERFACE} -j ACCEPT; iptables -A FORWARD -o ${WG_INTERFACE} -j ACCEPT; iptables -t nat -A POSTROUTING -o ${IFACE} -j MASQUERADE
PostDown = iptables -D FORWARD -i ${WG_INTERFACE} -j ACCEPT; iptables -D FORWARD -o ${WG_INTERFACE} -j ACCEPT; iptables -t nat -D POSTROUTING -o ${IFACE} -j MASQUERADE
EOF
chmod 600 /etc/wireguard/${WG_INTERFACE}.conf
echo "✓ WireGuard config created"

# ── 6. Start WireGuard ───────────────────────────────────────
echo "▶ Starting WireGuard..."
systemctl enable wg-quick@${WG_INTERFACE} -q
systemctl start wg-quick@${WG_INTERFACE}
echo "✓ WireGuard running"

# ── 7. Start microsocks SOCKS5 proxy ─────────────────────────
echo "▶ Starting SOCKS5 proxy (microsocks) on port ${SOCKS_PORT}..."
cat > /etc/systemd/system/microsocks.service << EOF
[Unit]
Description=microsocks SOCKS5 proxy
After=network.target

[Service]
ExecStart=/usr/bin/microsocks -p ${SOCKS_PORT}
Restart=always
User=nobody

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload -q
systemctl enable microsocks -q
systemctl start microsocks
echo "✓ SOCKS5 proxy running on port ${SOCKS_PORT}"

# ── 8. Configure firewall ─────────────────────────────────────
echo "▶ Configuring firewall..."
ufw allow 22/tcp   -q  # SSH
ufw allow ${WG_PORT}/udp -q  # WireGuard
ufw allow ${SOCKS_PORT}/tcp -q  # SOCKS5
ufw --force enable -q
echo "✓ Firewall configured"

# ── 9. Get server public IP ───────────────────────────────────
PUBLIC_IP=$(curl -s4 https://api.ipify.org || curl -s4 https://ifconfig.me)

# ── 10. Print summary ─────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                   ✅ SETUP COMPLETE                          ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║  Server IP      : ${PUBLIC_IP}"
echo "║  WireGuard Port : ${WG_PORT}/udp"
echo "║  SOCKS5 Port    : ${SOCKS_PORT}/tcp"
echo "║  DNS            : ${DNS}"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║  Public Key (copy this!):"
echo "║  ${SERVER_PUBLIC}"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║  NOW RUN in your local terminal:"
echo "║"
echo "║  node scripts/update-server-db.js \\"
echo "║    --serverId <MONGODB_SERVER_ID> \\"
echo "║    --ip ${PUBLIC_IP} \\"
echo "║    --publicKey \"${SERVER_PUBLIC}\""
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
