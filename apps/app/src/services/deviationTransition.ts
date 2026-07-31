export type ResolveDeviationRpcArgs = {
  p_organization_id: string;
  p_deviation_id: string;
  p_follow_up_comment: string | null;
};

export function buildResolveDeviationRpcArgs(
  organizationId: string,
  deviationId: string,
  followUpComment: string,
): ResolveDeviationRpcArgs {
  return {
    p_organization_id: organizationId,
    p_deviation_id: deviationId,
    p_follow_up_comment: followUpComment.trim() || null,
  };
}
