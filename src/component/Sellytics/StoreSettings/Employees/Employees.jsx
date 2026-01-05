import { useNotification } from './useNotification';
import { useTeamMembers } from './useTeamMembers';
import { useInviteLink } from './useInviteLink';

import TeamMemberCard from './TeamMemberCard';
import InviteCard from './InviteCard';
import NotificationBanner from './NotificationBanner';

export default function TeamManagementPage() {
  const { notification, notify } = useNotification();
  const { members, removeMember, suspendMember } = useTeamMembers(notify);
  const { inviteLink, generateInvite } = useInviteLink(notify);

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      {/* Global notifications */}
      <NotificationBanner notification={notification} />

      {/* Invite section */}
      <InviteCard inviteLink={inviteLink} onGenerate={generateInvite} />

      {/* Team members - single card per row */}
      <div className="flex flex-col gap-4">
        {members.map((m, index) => (
          <TeamMemberCard
            key={m.id}
            index={index}
            member={m}
            onRemove={removeMember}
            onSuspend={suspendMember}
          />
        ))}
      </div>
    </div>
  );
}
