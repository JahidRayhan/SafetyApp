enum GovtRequestStatus { pending, fulfilled, denied }

class GovtDataRequest {
  final String id;
  final String title;
  final String description;
  final String dataType;
  GovtRequestStatus status;
  final DateTime createdAt;

  GovtDataRequest({
    required this.id,
    required this.title,
    required this.description,
    required this.dataType,
    this.status = GovtRequestStatus.pending,
    DateTime? createdAt,
  }) : createdAt = createdAt ?? DateTime.now();
}

/// Ported from the govt_admin side of AdminRequests.tsx / adminRequestService.ts:
/// a govt_admin's own outgoing data requests (e.g. to external agencies),
/// distinct from AdminService's admin->govt requests. In-memory for now.
class GovtService {
  GovtService._();
  static final GovtService instance = GovtService._();

  final List<GovtDataRequest> _requests = [];
  int _nextId = 1;

  List<GovtDataRequest> get requests => [..._requests]..sort((a, b) => b.createdAt.compareTo(a.createdAt));

  GovtDataRequest submit({required String title, required String description, required String dataType}) {
    final req = GovtDataRequest(id: (_nextId++).toString(), title: title, description: description, dataType: dataType);
    _requests.add(req);
    return req;
  }
}
