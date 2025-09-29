defmodule StorymapWeb.Live.Map do
  use StorymapWeb, :live_view

  @spec render(any()) :: Phoenix.LiveView.Rendered.t()
  def render(assigns) do
    ~H"""
    <.live_component module={StorymapWeb.Live.MapComponent} id="visited-countries-map"/>
    """
  end

  def mount(_params, _, socket) do
    {:ok, socket}
  end
end
