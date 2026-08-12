import '../models/admin_request.dart';

/// Ported from AdminRequests.tsx (zone-request / data-modification-request
/// forms an admin submits upward to govt_admins) and AdminApprovals.tsx
/// (pending user/content approvals an admin actions). In-memory; console
/// "toast" style confirmation only — no backend routing yet.
class AdminService {
  AdminService._();
  static final AdminService instance = AdminService._();

  final List<AdminRequest> _requests = [];
  int _nextRequestId = 1;

  final List<PendingApproval> _approvals = [
    PendingApproval(
      id: '1',
      kind: ApprovalKind.userVerification,
      title: 'New user verification — Fahim R.',
      detail: 'Signed up 2 days ago, phone unverified.',
    ),
    PendingApproval(
      id: '2',
      kind: ApprovalKind.contentFlag,
      title: 'Community story flagged',
      detail: '"The SOS feature gave me peace of mind" — flagged by 1 user for review.',
    ),
  ];

  List<AdminRequest> get requests => [..._requests]..sort((a, b) => b.createdAt.compareTo(a.createdAt));
  List<PendingApproval> get approvals => [..._approvals];

  AdminRequest submitRequest({
    required AdminRequestType type,
    required String title,
    required String detail,
    required String urgency,
  }) {
    final req = AdminRequest(id: (_nextRequestId++).toString(), type: type, title: title, detail: detail, urgency: urgency);
    _requests.add(req);
    return req;
  }

  void resolveApproval(String id, {required bool approved}) {
    _approvals.removeWhere((a) => a.id == id);
  }

  void resolveRequest(String id, {required bool approved}) {
    final req = _requests.firstWhere((r) => r.id == id);
    req.status = approved ? AdminRequestStatus.approved : AdminRequestStatus.rejected;
  }
}
