/**
 * This function displays the image selected by the user
 */
function displayImage()
    {
        var file = document.getElementById("file").files[0];
        var render = new FileReader();
        render.onload = function(e) {
            var img = document.getElementById("image");
            img.src = e.target.result;
            img.width = 200;
            img.height = 200;
            img.style.display = "block";
            imageHash = web3.utils.sha3(e.target.result);
        };
        render.readAsDataURL(file);
    }

/**
 * This function creates a new NFT on the contract
 */
async function forgeNFT() 
{
    var zero = "0x0000000000000000000000000000000000000000000000000000000000000000";
    console.log("Uploaded image whose hash is: "+imageHash);
    var quantity = parseInt(document.getElementById("quantity").value);
    // Check if the NFT already exists
    contract.methods.NFTs(imageHash).call().then(function(res) {
        console.log(res[0]);
        if (res[0] !== zero)
        {
            alert("NFT already forged");
            return;
        }
        else
        {
            // Forge the NFT
            console.log("Forging NFT")
            console.log("Quantity: "+quantity)
            console.log("My address: "+myAddress)
            contract.methods.forge_NFT(imageHash, quantity).send({from: myAddress}).then(function() {
            alert("NFT forged");
            // the image is uploaded on the server with the hash as name
            document.getElementById("hash").value = imageHash;
            document.getElementById("form").submit();
            });
        }
    });
}