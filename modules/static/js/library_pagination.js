$(document).ready(function() {
  var currentPage = 1;
  var totalPages = 0;

  function populateGenres() {
      $.ajax({
          url: '/api/genres',
          method: 'GET',
          success: function(response) {
              var genreSelect = $('#genreSelect');
              genreSelect.empty().append($('<option>', { value: '', text: 'All Genres' }));
              response.forEach(function(genre) {
                  genreSelect.append($('<option>', {
                      value: genre.name,
                      text: genre.name
                  }));
              });
          },
          error: function(xhr, status, error) {
              console.error("Error fetching genres:", error);
          }
      });
  }

  function populateGameModes() {
      $.ajax({
          url: '/api/game_modes',
          method: 'GET',
          success: function(response) {
              var gameModeSelect = $('#gameModeSelect');
              gameModeSelect.empty().append($('<option>', { value: '', text: 'All Game Modes' }));
              response.forEach(function(gameMode) {
                  gameModeSelect.append($('<option>', {
                      value: gameMode.name,
                      text: gameMode.name
                  }));
              });
          },
          error: function(xhr, status, error) {
              console.error("Error fetching game modes:", error);
          }
      });
  }

  function populatePlayerPerspectives() {
      $.ajax({
          url: '/api/player_perspectives',
          method: 'GET',
          success: function(response) {
              var perspectiveSelect = $('#playerPerspectiveSelect');
              perspectiveSelect.empty().append($('<option>', { value: '', text: 'All Perspectives' }));
              response.forEach(function(perspective) {
                  perspectiveSelect.append($('<option>', {
                      value: perspective.name,
                      text: perspective.name
                  }));
              });
          },
          error: function(xhr, status, error) {
              console.error("Error fetching player perspectives:", error);
          }
      });
  }

  function populateThemes() {
      $.ajax({
          url: '/api/themes',
          method: 'GET',
          success: function(response) {
              var themeSelect = $('#themeSelect');
              themeSelect.empty().append($('<option>', { value: '', text: 'All Themes' }));
              response.forEach(function(theme) {
                  themeSelect.append($('<option>', {
                      value: theme.name,
                      text: theme.name
                  }));
              });
          },
          error: function(xhr, status, error) {
              console.error("Error fetching themes:", error);
          }
      });
  }

  function fetchFilteredGames(page) {
      page = page || 1; // Default to page 1 if not specified
      var filters = {
          page: page,
          per_page: 20,
          category: $('#categorySelect').val(),
          genre: $('#genreSelect').val(),
          gameMode: $('#gameModeSelect').val(),
          playerPerspective: $('#playerPerspectiveSelect').val(),
          theme: $('#themeSelect').val(),
          rating: $('#ratingSlider').val(),
      };

      $.ajax({
          url: '/browse_games',
          data: filters,
          method: 'GET',
          success: function(response) {
              totalPages = response.pages;
              currentPage = response.current_page;
              $('#currentPageInfo').text(currentPage + '/' + totalPages);
              updateGamesContainer(response.games);
              updatePaginationControls();
          },
          error: function(xhr, status, error) {
              console.error("AJAX error:", error);
          }
      });
  }

  function updateGamesContainer(games) {
      $('#gamesContainer').empty();

      if(games.length === 0) {
          $('#gamesContainer').append('<p>No games found.</p>');
          return;
      }

      games.forEach(function(game) {
          var gameCardHtml = createGameCardHtml(game);
          $('#gamesContainer').append(gameCardHtml);
      });
  }

  function createGameCardHtml(game) {
    var genres = game.genres ? game.genres.join(', ') : 'No Genres';
    var fullCoverUrl = game.cover_url.startsWith('http') ? game.cover_url : '/static/images/' + game.cover_url;
    var popupMenuHtml = createPopupMenuHtml(game); // Ensure this function generates the correct HTML for your popup menu

    var gameCardHtml = `
    <div class="game-card" onmouseover="showDetails(this, '${game.uuid}')" onmouseout="hideDetails()" data-name="${game.name}" data-size="${game.size}" data-genres="${genres}">
        <button id="menuButton-${game.uuid}" class="button-glass-hamburger"><i class="fas fa-bars"></i></button>
        ${popupMenuHtml}
        <a href="/game_details/${game.uuid}">
            <img src="${fullCoverUrl}" alt="${game.name}" class="game-cover">
        </a>
        <div id="details-${game.uuid}" class="popup-game-details hidden">
            <!-- Details and screenshots will be injected here by JavaScript -->
        </div>
    </div>
    `;
    return gameCardHtml;
}

function createPopupMenuHtml(game) {
    // when modifying this function, make sure to update the popup_menu.html template as well
    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    return `
    <div id="popupMenu-${game.uuid}" class="popup-menu" style="display: none;">
        <form action="/download_game/${game.uuid}" method="get" class="menu-item">
            <button type="submit" class="menu-button">Download</button>
        </form>

        <form action="/game_edit/${game.uuid}" method="get" class="menu-item">
            <button type="submit" class="menu-button">Edit Details</button>
        </form>
        
        <form action="/edit_game_images/${game.uuid}" method="get" class="menu-item">
            <button type="submit" class="menu-button">Edit Images</button>
        </form>

        <form action="/refresh_game_images/${game.uuid}" method="post" class="menu-item">
            <input type="hidden" name="csrf_token" value="${csrfToken}">
            <button type="submit" class="menu-button">Refresh Images</button>
        </form>
        <div class="menu-item">
            <button type="button" class="menu-button delete-game" data-game-uuid="${game.uuid}">Remove Game</button>
        </div>
        <div class="menu-item">
            <a href="${game.url}" target="_blank" class="menu-button" style="text-decoration: none; color: inherit;">Open IGDB Page</a>
        </div>
    </div>
    `;
}



  function updatePaginationControls() {
      $('#prevPage').parent().toggleClass('disabled', currentPage <= 1);
      $('#nextPage').parent().toggleClass('disabled', currentPage >= totalPages);
  }

  $('#prevPage').click(function(e) {
      e.preventDefault();
      if (currentPage > 1) {
          fetchFilteredGames(--currentPage);
      }
  });

  $('#nextPage').click(function(e) {
      e.preventDefault();
      if (currentPage < totalPages) {
          fetchFilteredGames(++currentPage);
      }
  });

  $('#filterForm').on('submit', function(e) {
      e.preventDefault();
      fetchFilteredGames(1);
  });

  $('#ratingSlider').on('input', function() {
      $('#ratingValue').text($(this).val());
  });

  // Initialize filter dropdowns and fetch games on load
  populateGenres();
  populateThemes();
  populateGameModes();
  populatePlayerPerspectives();
  fetchFilteredGames();
});