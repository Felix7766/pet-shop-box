App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Load pets.
    $.getJSON('../pets.json', function(data) {
      App.petsData = data;
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      for (i = 0; i < data.length; i++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);
        petTemplate.find('.btn-refund').attr('data-id', data[i].id).css('display', 'none');

        petsRow.append(petTemplate.html());
      }
    });

    return await App.initWeb3();
  },

  initWeb3: async function() {
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access");
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Adoption.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var AdoptionArtifact = data;
      App.contracts.Adoption = TruffleContract(AdoptionArtifact);

      // Set the provider for our contract
      App.contracts.Adoption.setProvider(App.web3Provider);

      // Use our contract to retrieve and mark the adopted pets
      return App.markAdopted();
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
    $(document).on('click', '.btn-refund', App.handleRefund);
  },

  getPetsData: function() {
    return App.petsData; // ���ش洢�ĳ�������
  },

  markAdopted: function() {
    var adoptionInstance;

    App.contracts.Adoption.deployed().then(function(instance) {
      adoptionInstance = instance;

      return adoptionInstance.getAdopters.call();
    }).then(function(adopters) {
      for (i = 0; i < adopters.length; i++) {
        var adoptedPanel = $('.panel-pet').eq(i);
        var adoptButton = adoptedPanel.find('.btn-adopt');
        var refundButton = adoptedPanel.find('.btn-refund');

        if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
          // ��������ѱ�����
          adoptButton.text('Adopted').attr('disabled', true).css('display', 'none'); // ���ò����� Adopt ��ť
          refundButton.text('Refund').removeAttr('disabled').css('display', 'inline-block');
          
        } else {
          // �������δ������
          adoptButton.text('Adopt').removeAttr('disabled').css('display', 'inline-block'); // ���ò���ʾ Adopt ��ť
          refundButton.text('Refund').attr('disabled', true).css('display', 'none'); // �Ƴ� Refund ��ť��������ڣ�

        
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  handleAdopt: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    var adoptionInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Adoption.deployed().then(function(instance) {
        adoptionInstance = instance;
            return Promise.all([
                instance.adopt(petId, { from: account }),
                instance.getAdopters_history.call()
            ]);
      }).then(function(results) {
            var adoptResult = results[0];
            var adoptersHistory = results[1];
            
            App.markAdopted();
            // Get pet information
            var petData = App.getPetsData()[petId];
            var time = new Date().toLocaleString();
            
            // Check if there's adoption history for this pet
            var historyAddress = adoptersHistory[petId];
            var historyText = (historyAddress === '0x0000000000000000000000000000000000000000') 
                ? 'Never been adopted before' 
                : 'Previous adopter: ' + historyAddress;
            
            // Show adoption success message
            alert('Adoption Successful!\n' +
                'Pet ID: ' + petId + '\n' +
                'Pet Name: ' + petData.name + '\n' +
                historyText + '\n' +
                'Time: ' + time);

      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  handleRefund: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    var adoptionInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Adoption.deployed().then(function(instance) {
        adoptionInstance = instance;

        return adoptionInstance.refund(petId, { from: account });
      }).then(function(result) {
        App.markAdopted();
        // ��ȡ������Ϣ
        var petData = App.getPetsData()[petId];
        var time = new Date().toLocaleString();

        // ��ʾ�˻��ɹ���Ϣ
        alert('Refund Successful!\n' +
              'Pet ID: ' + petId + '\n' +
              'Pet Name: ' + petData.name + '\n' +
              'Time: ' + time);
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});