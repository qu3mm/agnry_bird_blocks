// Pre-generated 30 Participant accounts (P01 to P30)
export const PARTICIPANTS = Array.from({ length: 30 }, (_, i) => {
  const num = String(i + 1).padStart(2, '0');
  return {
    id: `P${num}`,
    name: `Participant ${num}`,
    passcode: `code${num}`
  };
});

export function isValidParticipant(id, passcode) {
  if (!id) return false;
  const cleanId = id.trim().toUpperCase();
  const user = PARTICIPANTS.find((p) => p.id === cleanId);
  if (!user) return false;
  // If passcode is provided, match it; otherwise allow ID-only login
  if (!passcode) return true;
  return user.passcode.toLowerCase() === passcode.trim().toLowerCase();
}
