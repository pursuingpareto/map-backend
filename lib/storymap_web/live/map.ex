defmodule StorymapWeb.Live.Map do
  use StorymapWeb, :live_view

  @spec render(any()) :: Phoenix.LiveView.Rendered.t()
  def render(assigns) do
    user_id = assigns.current_scope.user.id
    assigns = assign(assigns, :user_id, user_id)
    ~H"""
    <.live_component user_id={@user_id} module={StorymapWeb.Live.MapComponent} id="visited-countries-map"/>
    """
  end

  def mount(_params, _, socket) do
    {:ok, socket}
  end
end
