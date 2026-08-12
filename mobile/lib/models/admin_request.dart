enum AdminRequestType { zoneRequest, dataModification }
enum AdminRequestStatus { pending, approved, rejected }

class AdminRequest {
  final String id;
  final AdminRequestType type;
  final String title;
  final String detail;
  final String urgency; // low/medium/high, matches original's free-text urgency field
  AdminRequestStatus status;
  final DateTime createdAt;

  AdminRequest({
    required this.id,
    required this.type,
    required this.title,
    required this.detail,
    required this.urgency,
    this.status = AdminRequestStatus.pending,
    DateTime? createdAt,
  }) : createdAt = createdAt ?? DateTime.now();
}

enum ApprovalKind { userVerification, roleUpgrade, contentFlag }

class PendingApproval {
  final String id;
  final ApprovalKind kind;
  final String title;
  final String detail;
  final DateTime createdAt;

  PendingApproval({
    required this.id,
    required this.kind,
    required this.title,
    required this.detail,
    DateTime? createdAt,
  }) : createdAt = createdAt ?? DateTime.now();
}
