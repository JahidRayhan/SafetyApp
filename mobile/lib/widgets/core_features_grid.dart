import 'package:flutter/material.dart';
import '../core/navigation_items.dart';
import 'feature_card.dart';

/// Ported from CoreFeatures.tsx: `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4`.
/// LayoutBuilder recreates the same responsive column breakpoints natively.
class CoreFeaturesGrid extends StatelessWidget {
  final List<NavItem> items;
  final ValueChanged<String> onSelect;

  const CoreFeaturesGrid({super.key, required this.items, required this.onSelect});

  int _columnsFor(double width) {
    if (width >= 1024) return 4; // lg
    if (width >= 768) return 3; // md
    return 2; // base
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final columns = _columnsFor(constraints.maxWidth);
        return GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: items.length,
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: columns,
            mainAxisSpacing: 12,
            crossAxisSpacing: 12,
            childAspectRatio: 1,
          ),
          itemBuilder: (context, index) {
            final item = items[index];
            return FeatureCard(
              icon: item.icon,
              label: item.label,
              onTap: () => onSelect(item.id),
            );
          },
        );
      },
    );
  }
}
