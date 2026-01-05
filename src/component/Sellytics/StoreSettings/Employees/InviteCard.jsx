import { FaCopy, FaWhatsapp } from 'react-icons/fa';

export default function InviteCard({ inviteLink, onGenerate }) {
  const copy = () => navigator.clipboard.writeText(inviteLink);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold mb-3">Invite Team Member</h3>

      <button
        onClick={onGenerate}
        className="px-4 py-2 bg-indigo-700 text-white rounded mb-3"
      >
        Generate Invite Link
      </button>

      {inviteLink && (
        <div className="flex gap-2">
          <input
            value={inviteLink}
            readOnly
            className="flex-1 p-2 border rounded text-sm"
          />
          <button onClick={copy} className="p-2 bg-gray-200 rounded">
            <FaCopy />
          </button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(inviteLink)}`}
            target="_blank"
            rel="noreferrer"
            className="p-2 bg-green-600 text-white rounded"
          >
            <FaWhatsapp />
          </a>
        </div>
      )}
    </div>
  );
}
